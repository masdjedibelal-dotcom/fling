import { View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { FlingIcon, type FlingIconName } from '@/components/icons/FlingIcon';
import { PressableScale } from '@/components/ui/PressableScale';
import { FLING_COLORS, FLING_TOUCH } from '@/lib/designTokens';
import { triggerHaptic } from '@/lib/haptics';

const ROUTE_ICON: Record<string, FlingIconName> = {
  index: 'home',
  pick: 'pick',
  profile: 'profile',
};

function TabItem({
  focused,
  icon,
  onPress,
}: {
  focused: boolean;
  icon: FlingIconName;
  onPress: () => void;
}) {
  const scale = useSharedValue(focused ? 1.08 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, {
      damping: 16,
      stiffness: 280,
    });
  }, [focused, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const color = focused
    ? icon === 'pick'
      ? FLING_COLORS.accent
      : FLING_COLORS.fg
    : FLING_COLORS.fgMuted;

  return (
    <PressableScale
      onPress={() => {
        if (!focused) triggerHaptic('light');
        onPress();
      }}
      haptic={false}
      scale={0.94}
      className="items-center justify-center min-w-[72px]"
      style={{ minHeight: FLING_TOUCH.min }}
    >
      <Animated.View style={iconStyle}>
        <FlingIcon name={icon} size={FLING_TOUCH.icon} color={color} />
      </Animated.View>
      <View
        className="mt-1.5 rounded-full"
        style={{
          width: 5,
          height: 5,
          backgroundColor: focused ? FLING_COLORS.accent : 'transparent',
        }}
      />
    </PressableScale>
  );
}

export function FlingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-bg border-t border-line"
      style={{ paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10 }}
    >
      <View className="flex-row items-end justify-around px-6">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = ROUTE_ICON[route.name] ?? 'home';

          return (
            <TabItem
              key={route.key}
              focused={focused}
              icon={icon}
              onPress={() => navigation.navigate(route.name)}
            />
          );
        })}
      </View>
    </View>
  );
}

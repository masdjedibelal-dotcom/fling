import { View, Pressable } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlingIcon, type FlingIconName } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TOUCH } from '@/lib/designTokens';

const ROUTE_ICON: Record<string, FlingIconName> = {
  index: 'home',
  pick: 'pick',
  profile: 'profile',
};

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
          const color = focused
            ? icon === 'pick'
              ? FLING_COLORS.accent
              : FLING_COLORS.fg
            : FLING_COLORS.fgMuted;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              className="items-center justify-center min-w-[72px]"
              style={{ minHeight: FLING_TOUCH.min }}
            >
              <FlingIcon name={icon} size={FLING_TOUCH.icon} color={color} />
              <View
                className="mt-1.5 rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  backgroundColor: focused ? FLING_COLORS.accent : 'transparent',
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

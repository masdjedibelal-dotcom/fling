import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { triggerHaptic, type HapticStyle } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: ReactNode;
  scale?: number;
  haptic?: HapticStyle | false;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function PressableScale({
  children,
  scale = 0.97,
  haptic = 'light',
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...props
}: Props) {
  const pressed = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
    opacity: pressed.value < 1 ? 0.92 : 1,
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[animStyle, style]}
      onPressIn={(e) => {
        pressed.value = withTiming(scale, { duration: 70 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.value = withSpring(1, { damping: 18, stiffness: 320 });
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic && !disabled) triggerHaptic(haptic);
        onPress?.(e);
      }}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

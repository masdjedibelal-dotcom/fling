import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  View,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FLING_BUTTON_GRADIENT, FLING_TYPE } from '@/lib/designTokens';

type Variant = 'primary' | 'ghost' | 'dark';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
}

const variantStyles: Record<
  Variant,
  { container: string; text: string; useGradient?: boolean }
> = {
  primary: { container: '', text: 'text-white', useGradient: true },
  ghost: {
    container: 'bg-white/[0.06]',
    text: 'text-fg-2',
  },
  dark: {
    container: 'bg-white/[0.06]',
    text: 'text-fg',
  },
};

export function Button({
  label,
  variant = 'primary',
  loading,
  disabled,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  const inner = loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text
      className={`font-body font-semibold tracking-tight ${v.text}`}
      style={{ fontSize: FLING_TYPE.body }}
    >
      {label}
    </Text>
  );

  if (v.useGradient) {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        className={`w-full ${isDisabled ? 'opacity-40' : 'opacity-100'} ${className ?? ''}`}
        style={styles.primaryPressable}
        {...props}
      >
        <LinearGradient
          colors={[...FLING_BUTTON_GRADIENT]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.primaryGradient}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`w-full rounded-pill py-4 px-5 items-center justify-center ${v.container} ${
        isDisabled ? 'opacity-40' : 'opacity-100'
      } ${className ?? ''}`}
      {...props}
    >
      {inner}
    </Pressable>
  );
}

const PILL_RADIUS = 999;

const styles = StyleSheet.create({
  primaryPressable: {
    backgroundColor: 'transparent',
    borderRadius: PILL_RADIUS,
    overflow: 'hidden',
  },
  primaryGradient: {
    borderRadius: PILL_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

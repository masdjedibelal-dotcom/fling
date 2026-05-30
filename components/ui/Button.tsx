import {
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FLING_BUTTON_GRADIENT, FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

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
    container: 'bg-white/[0.04] border border-white/12',
    text: 'text-fg-2',
  },
  dark: {
    container: 'bg-white/[0.06] border border-white/10',
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
        style={[styles.primaryPressable, !isDisabled && primaryShadowStyle()]}
        {...props}
      >
        <LinearGradient
          colors={[...FLING_BUTTON_GRADIENT]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.primaryGradient}
        >
          <View pointerEvents="none" style={styles.primarySheen} />
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
    overflow: 'visible',
  },
  primaryGradient: {
    borderRadius: PILL_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primarySheen: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderRadius: PILL_RADIUS,
    backgroundColor: 'transparent',
  },
});

function primaryShadowStyle() {
  if (Platform.OS === 'web') return undefined;
  if (Platform.OS === 'android') return { elevation: 6 };
  return {
    shadowColor: FLING_COLORS.accent,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  };
}

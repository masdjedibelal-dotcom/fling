import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';

type Variant = 'primary' | 'ghost' | 'dark';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-accent',
    text: 'text-white',
  },
  ghost: {
    container: 'bg-transparent border border-line-2',
    text: 'text-fg',
  },
  dark: {
    container: 'bg-white/5 border border-line',
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

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`w-full rounded-pill py-3.5 px-5 items-center justify-center ${v.container} ${
        isDisabled ? 'opacity-40' : 'opacity-100'
      } ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className={`font-body text-sm font-semibold ${v.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}

import { Text, TextProps } from 'react-native';

export function DisplayText({ className, ...props }: TextProps) {
  return (
    <Text
      className={`font-display text-white ${className ?? ''}`}
      {...props}
    />
  );
}

export function BodyText({ className, ...props }: TextProps) {
  return (
    <Text
      className={`font-body text-fg-3 text-[13.5px] leading-[22px] ${className ?? ''}`}
      {...props}
    />
  );
}

export function MetaText({ className, ...props }: TextProps) {
  return (
    <Text
      className={`font-mono text-[10px] uppercase tracking-widest text-fg-4 ${className ?? ''}`}
      {...props}
    />
  );
}

export function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="font-body text-[10px] uppercase tracking-[2px] text-fg-4 font-semibold">
      {children}
    </Text>
  );
}

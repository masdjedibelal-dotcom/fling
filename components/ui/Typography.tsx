import { Text, TextProps } from 'react-native';
import { FLING_TYPE } from '@/lib/designTokens';

export function DisplayText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-display text-white font-bold ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.display, lineHeight: 36, letterSpacing: -0.8 }, style]}
      {...props}
    />
  );
}

export function HeroText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-display text-white font-extrabold ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.displayHero, lineHeight: 38, letterSpacing: -1 }, style]}
      {...props}
    />
  );
}

export function ScreenTitle({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-display text-white font-bold ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.screenTitle, lineHeight: 30, letterSpacing: -0.6 }, style]}
      {...props}
    />
  );
}

export function TitleText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-display text-white font-bold ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.title, lineHeight: 28, letterSpacing: -0.5 }, style]}
      {...props}
    />
  );
}

export function BodyText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body text-fg-3 ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.body, lineHeight: 24 }, style]}
      {...props}
    />
  );
}

export function BodyLarge({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body text-fg-2 ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.bodyLarge, lineHeight: 26 }, style]}
      {...props}
    />
  );
}

/** Dezente Sektion — nicht 10px Dashboard-Label */
export function SectionLabel({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body uppercase tracking-[2px] text-fg-4 font-semibold ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.caption, marginBottom: 10 }, style]}
      {...props}
    />
  );
}

export function MetaText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body text-fg-4 ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.meta, lineHeight: 18 }, style]}
      {...props}
    />
  );
}

export function CaptionText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body text-fg-3 ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.caption, lineHeight: 18 }, style]}
      {...props}
    />
  );
}

export function SubheadText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body text-fg-2 ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.subhead, lineHeight: 20 }, style]}
      {...props}
    />
  );
}

export function CalloutText({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body text-white ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.callout, lineHeight: 22 }, style]}
      {...props}
    />
  );
}

export function StepLabel({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-body uppercase tracking-[2.5px] text-accent font-semibold ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.caption }, style]}
      {...props}
    />
  );
}

export function ChatPartnerName({ className, style, ...props }: TextProps) {
  return (
    <Text
      className={`font-display text-white font-bold text-center ${className ?? ''}`}
      style={[{ fontSize: FLING_TYPE.title, lineHeight: 26, letterSpacing: -0.6 }, style]}
      {...props}
    />
  );
}

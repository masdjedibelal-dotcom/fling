import { useId } from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';
import { usePulse, useRipple } from './useGraphicMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { size?: number };

const DUST: [number, number, number][] = [
  [40, 50, 2],
  [220, 70, 2.5],
  [30, 180, 2],
  [225, 210, 2],
  [220, 150, 1.5],
];

function RippleRing({ delayMs }: { delayMs: number }) {
  const animatedProps = useRipple(delayMs);
  return (
    <AnimatedCircle
      cx={0}
      cy={0}
      fill="none"
      stroke={FLING_COLORS.accent}
      strokeWidth={1}
      animatedProps={animatedProps}
    />
  );
}

export function OnboardingManGraphic({ size = 220 }: Props) {
  const uid = useId().replace(/:/g, '');
  const { scale, opacity } = usePulse(2400);
  const centerProps = useAnimatedProps(() => ({
    opacity: opacity.value,
    r: 22 * scale.value,
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 260 260">
      <Defs>
        <RadialGradient id={`haloWait-${uid}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={FLING_COLORS.accent} stopOpacity="0.5" />
          <Stop offset="100%" stopColor={FLING_COLORS.accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <G opacity={0.35}>
        {DUST.map(([cx, cy, r], i) => (
          <Circle key={i} cx={cx} cy={cy} r={r} fill="#fff" opacity={0.2} />
        ))}
      </G>

      <G transform="translate(130 130)">
        <RippleRing delayMs={0} />
        <RippleRing delayMs={1050} />
        <RippleRing delayMs={2100} />
        <Circle r={100} fill={`url(#haloWait-${uid})`} opacity={0.4} />
        <Circle r={68} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1} opacity={0.12} />
        <Circle r={42} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1} opacity={0.22} />
        <AnimatedCircle fill={FLING_COLORS.accent} animatedProps={centerProps} />
      </G>
    </Svg>
  );
}

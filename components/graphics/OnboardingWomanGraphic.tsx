import { useId } from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';
import { usePulse } from './useGraphicMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { size?: number };

const WAIT_DOTS: [number, number][] = [
  [80, 100],
  [195, 130],
  [100, 200],
  [180, 60],
];

const DUST: [number, number, number][] = [
  [60, 60, 2.5],
  [210, 80, 3],
  [35, 190, 2],
  [225, 200, 2.5],
  [170, 40, 1.8],
  [40, 130, 1.8],
];

export function OnboardingWomanGraphic({ size = 220 }: Props) {
  const uid = useId().replace(/:/g, '');
  const { scale, opacity } = usePulse(2600);
  const centerProps = useAnimatedProps(() => ({
    opacity: opacity.value,
    r: 26 * scale.value,
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 260 260">
      <Defs>
        <RadialGradient id={`haloPick-${uid}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={FLING_COLORS.accent} stopOpacity="0.55" />
          <Stop offset="60%" stopColor={FLING_COLORS.accent} stopOpacity="0.08" />
          <Stop offset="100%" stopColor={FLING_COLORS.accent} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id={`haloDim-${uid}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
          <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <G opacity={0.45}>
        {DUST.map(([cx, cy, r], i) => (
          <Circle key={i} cx={cx} cy={cy} r={r} fill="#fff" opacity={0.22} />
        ))}
      </G>

      {WAIT_DOTS.map(([cx, cy], i) => (
        <G key={i}>
          <Circle cx={cx} cy={cy} r={14} fill={`url(#haloDim-${uid})`} />
          <Circle cx={cx} cy={cy} r={6} fill="#fff" opacity={0.35} />
        </G>
      ))}

      <G transform="translate(130 130)">
        <Circle r={90} fill={`url(#haloPick-${uid})`} />
        <Circle r={60} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1} opacity={0.18} />
        <Circle r={42} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1} opacity={0.35} />
        <AnimatedCircle fill={FLING_COLORS.accent} animatedProps={centerProps} />
      </G>
    </Svg>
  );
}

import { useId } from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';
import { useScatter } from './useGraphicMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { size?: number };

const SCATTER_DOTS: {
  cx: number;
  cy: number;
  r: number;
  dx: number;
  dy: number;
  delay: number;
  baseOpacity: number;
}[] = [
  { cx: 155, cy: 98, r: 6, dx: 28, dy: -8, delay: 0, baseOpacity: 0.7 },
  { cx: 175, cy: 125, r: 4, dx: 34, dy: 12, delay: 500, baseOpacity: 0.55 },
  { cx: 195, cy: 85, r: 3, dx: 42, dy: -14, delay: 1000, baseOpacity: 0.4 },
  { cx: 220, cy: 135, r: 2.5, dx: 48, dy: 18, delay: 1500, baseOpacity: 0.3 },
  { cx: 245, cy: 105, r: 2, dx: 50, dy: -10, delay: 2000, baseOpacity: 0.2 },
  { cx: 170, cy: 160, r: 3, dx: 30, dy: 15, delay: 800, baseOpacity: 0.45 },
  { cx: 205, cy: 160, r: 2, dx: 38, dy: 10, delay: 1200, baseOpacity: 0.3 },
];

function ScatterDot({
  cx,
  cy,
  r,
  dx,
  dy,
  delay,
  baseOpacity,
}: (typeof SCATTER_DOTS)[0]) {
  const t = useScatter(delay, 5000);
  const animatedProps = useAnimatedProps(() => {
    const p = t.value;
    return {
      cx: cx + dx * p,
      cy: cy + dy * p,
      opacity: baseOpacity * (1 - p * 0.6),
    };
  });

  return (
    <AnimatedCircle fill={FLING_COLORS.accent} animatedProps={animatedProps} r={r} />
  );
}

export function ExpiredDissolveGraphic({ size = 280 }: Props) {
  const uid = useId().replace(/:/g, '');

  return (
    <Svg width={size} height={(size * 220) / 280} viewBox="0 0 280 220">
      <Defs>
        <RadialGradient id={`expHalo-${uid}`} cx="35%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={FLING_COLORS.accent} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={FLING_COLORS.accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <G transform="translate(95 110)">
        <Circle r={80} fill={`url(#expHalo-${uid})`} opacity={0.6} />
        <Circle r={44} fill={FLING_COLORS.accent} opacity={0.5} />
        <Circle r={32} fill={FLING_COLORS.accent} opacity={0.7} />
      </G>

      {SCATTER_DOTS.map((dot, i) => (
        <ScatterDot key={i} {...dot} />
      ))}
    </Svg>
  );
}

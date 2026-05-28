import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = { size?: number };

const CHECK_DOTS: [number, number][] = [
  [-8, 2],
  [-2, 8],
  [4, 2],
  [9, -4],
  [13, -10],
];

/** Punktförmiger Check auf Crimson-Scheibe */
export function VerifiedStamp({ size = 72 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180">
      <G transform="translate(90 90)">
        <Circle r={80} fill={FLING_COLORS.accent} opacity={0.06} />
        <Circle r={60} fill={FLING_COLORS.accent} opacity={0.12} />
        <Circle r={42} fill={FLING_COLORS.accent} />
        {CHECK_DOTS.map(([cx, cy], i) => (
          <Circle key={i} cx={cx} cy={cy} r={3} fill={FLING_COLORS.bg} />
        ))}
      </G>
    </Svg>
  );
}

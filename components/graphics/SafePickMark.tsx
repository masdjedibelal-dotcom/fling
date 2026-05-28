import Svg, { Circle, G } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = { size?: number };

/** Drei Schutz-Ringe um einen Kern — Safe Pick */
export function SafePickMark({ size = 72 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180">
      <G transform="translate(90 90)">
        <Circle r={70} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1} opacity={0.18} />
        <Circle r={54} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1.4} opacity={0.4} />
        <Circle r={38} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1.8} opacity={0.65} />
        <Circle r={20} fill={FLING_COLORS.accent} opacity={0.95} />
        <Circle r={6} fill={FLING_COLORS.bg} />
      </G>
    </Svg>
  );
}

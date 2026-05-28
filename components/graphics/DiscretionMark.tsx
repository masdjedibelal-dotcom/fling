import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = { size?: number };

/** Vesica Piscis — Diskretion & Verbindung */
export function DiscretionMark({ size = 72 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180">
      <G transform="translate(90 90)">
        <Circle cx={-20} cy={0} r={42} fill={FLING_COLORS.accent} opacity={0.5} />
        <Circle cx={20} cy={0} r={42} fill={FLING_COLORS.accent} opacity={0.5} />
        <Ellipse cx={0} cy={0} rx={12} ry={38} fill={FLING_COLORS.accent} />
      </G>
    </Svg>
  );
}

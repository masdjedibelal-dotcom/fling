import { useId } from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';
import {
  FLING_MARK_F_PATH,
  FLING_MARK_TILE_RADIUS,
  FLING_MARK_VIEWBOX,
} from '@/lib/flingMarkSvg';

type Props = {
  size?: number;
  radius?: number;
  /** F-Farbe; Hintergrund bleibt Wein-Verlauf */
  color?: string;
  /** Nur das F ohne Kachel (z. B. in der App-Leiste) */
  letterOnly?: boolean;
};

/** App-Marke: Funken-Kerbe auf dunklem Wein-Tile (Option 5) */
export function FlingMark({
  size = 80,
  radius = FLING_MARK_TILE_RADIUS,
  color = FLING_COLORS.accent,
  letterOnly = false,
}: Props) {
  const gradId = useId().replace(/:/g, '');
  const scale = size / FLING_MARK_VIEWBOX;
  const rx = radius * scale;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${FLING_MARK_VIEWBOX} ${FLING_MARK_VIEWBOX}`}>
      {!letterOnly ? (
        <Defs>
          <LinearGradient
            id={gradId}
            x1={FLING_MARK_VIEWBOX / 2}
            y1="0"
            x2={FLING_MARK_VIEWBOX / 2}
            y2={String(FLING_MARK_VIEWBOX)}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#4a1824" />
            <Stop offset="0.42" stopColor={FLING_COLORS.card} />
            <Stop offset="1" stopColor={FLING_COLORS.bg} />
          </LinearGradient>
        </Defs>
      ) : null}
      {!letterOnly ? (
        <Rect
          width={FLING_MARK_VIEWBOX}
          height={FLING_MARK_VIEWBOX}
          rx={rx / scale}
          fill={`url(#${gradId})`}
        />
      ) : null}
      <Path d={FLING_MARK_F_PATH} fill={color} />
    </Svg>
  );
}

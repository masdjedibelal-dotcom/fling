import Svg, { Circle, Path } from 'react-native-svg';
import {
  FINE_LINE_ICONS,
  type FineIconName,
} from '@/lib/fineLineIcons';
import { FLING_COLORS, FLING_ICON_SIZE } from '@/lib/designTokens';

export type FlingIconName = FineIconName;

const STROKE = 1.5;

type Props = {
  name: FlingIconName;
  size?: number;
  color?: string;
};

/** Fine-Line Icons — 1.5px Stroke, runde Joins (Fling.html / Graphics v2) */
export function FlingIcon({
  name,
  size = FLING_ICON_SIZE,
  color = FLING_COLORS.fg,
}: Props) {
  const paths = FINE_LINE_ICONS[name];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths.map((p, i) => {
        if (p.kind === 'circle') {
          if ('filled' in p && p.filled) {
            return (
              <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={color} />
            );
          }
          return (
            <Circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
            />
          );
        }
        if ('filled' in p && p.filled) {
          return <Path key={i} d={p.d} fill={color} />;
        }
        return (
          <Path
            key={i}
            d={p.d}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}

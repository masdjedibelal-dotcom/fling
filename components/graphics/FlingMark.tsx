import { useId } from 'react';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = {
  size?: number;
  radius?: number;
  color?: string;
};

/** App-Icon: F als negative Form auf Crimson */
export function FlingMark({
  size = 80,
  radius = 18,
  color = FLING_COLORS.accent,
}: Props) {
  const maskId = useId().replace(/:/g, '');
  const scale = size / 80;
  const rx = radius * scale;

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Defs>
        <Mask id={maskId} x="0" y="0" width="80" height="80">
          <Rect width="80" height="80" fill="#fff" />
          <Rect x="18" y="14" width="13" height="52" rx="1.5" fill="#000" />
          <Rect x="18" y="14" width="42" height="12" rx="1.5" fill="#000" />
          <Rect x="18" y="37" width="32" height="11" rx="1.5" fill="#000" />
        </Mask>
      </Defs>
      <Rect width="80" height="80" rx={rx} fill={color} mask={`url(#${maskId})`} />
    </Svg>
  );
}

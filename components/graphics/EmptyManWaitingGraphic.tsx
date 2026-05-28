import Animated from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';
import { useRipple } from './useGraphicMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { size?: number };

function RippleRing({ delayMs }: { delayMs: number }) {
  const animatedProps = useRipple(delayMs, 3500);
  return (
    <AnimatedCircle
      cx={0}
      cy={0}
      fill="none"
      stroke={FLING_COLORS.accent}
      strokeWidth={1.2}
      animatedProps={animatedProps}
    />
  );
}

export function EmptyManWaitingGraphic({ size = 180 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 220 220">
      <G opacity={0.4}>
        <Circle cx={55} cy={55} r={1.5} fill="#fff" opacity={0.2} />
        <Circle cx={170} cy={50} r={2} fill="#fff" opacity={0.18} />
        <Circle cx={50} cy={170} r={1.5} fill="#fff" opacity={0.16} />
        <Circle cx={180} cy={170} r={1.8} fill="#fff" opacity={0.2} />
      </G>

      <G transform="translate(110 110)">
        <RippleRing delayMs={0} />
        <RippleRing delayMs={1160} />
        <RippleRing delayMs={2330} />
        <Circle r={40} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        <Circle r={22} fill="rgba(255,255,255,0.04)" />
        <Circle r={6} fill={FLING_COLORS.accent} opacity={0.85} />
      </G>
    </Svg>
  );
}

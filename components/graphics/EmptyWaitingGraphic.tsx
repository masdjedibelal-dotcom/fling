import { useId } from 'react';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, RadialGradient, Stop } from 'react-native-svg';
import { FLING_COLORS } from '@/lib/designTokens';
import { usePulse } from './useGraphicMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { size?: number };

export function EmptyWaitingGraphic({ size = 180 }: Props) {
  const uid = useId().replace(/:/g, '');
  const { scale, opacity } = usePulse(2800);
  const ringProps = useAnimatedProps(() => ({
    opacity: 0.4 * opacity.value,
    r: 80 * scale.value,
  }));
  const dotProps = useAnimatedProps(() => ({
    opacity: 0.6 * opacity.value,
    r: 4 * scale.value,
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 220 220">
      <Defs>
        <RadialGradient id={`emptyHalo-${uid}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={FLING_COLORS.accent} stopOpacity="0" />
          <Stop offset="70%" stopColor={FLING_COLORS.accent} stopOpacity="0" />
          <Stop offset="92%" stopColor={FLING_COLORS.accent} stopOpacity="0.5" />
          <Stop offset="100%" stopColor={FLING_COLORS.accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <G opacity={0.4}>
        <Circle cx={40} cy={40} r={1.5} fill="#fff" opacity={0.2} />
        <Circle cx={180} cy={60} r={2} fill="#fff" opacity={0.18} />
        <Circle cx={30} cy={180} r={1.8} fill="#fff" opacity={0.16} />
        <Circle cx={190} cy={180} r={2} fill="#fff" opacity={0.2} />
      </G>

      <G transform="translate(110 110)">
        <Circle r={100} fill={`url(#emptyHalo-${uid})`} opacity={0.6} />
        <AnimatedCircle
          fill="none"
          stroke={FLING_COLORS.accent}
          strokeWidth={1.6}
          animatedProps={ringProps}
        />
        <Circle r={60} fill="none" stroke={FLING_COLORS.accent} strokeWidth={1} opacity={0.2} />
        <AnimatedCircle fill={FLING_COLORS.accent} animatedProps={dotProps} />
      </G>
    </Svg>
  );
}

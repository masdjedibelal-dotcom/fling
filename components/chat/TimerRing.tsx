import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Image } from 'expo-image';

const SIZE = 88;
const STROKE = 3;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TimerRing({
  photoUri,
  progress,
  color,
}: {
  photoUri: string;
  progress: number;
  color: string;
}) {
  const offsetSv = useSharedValue(CIRC * (1 - progress));

  useEffect(() => {
    offsetSv.value = withTiming(CIRC * (1 - progress), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, offsetSv]);

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: offsetSv.value,
  }));

  return (
    <View className="w-[88px] h-[88px] items-center justify-center">
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRC} ${CIRC}`}
          animatedProps={circleProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View className="w-[72px] h-[72px] rounded-full overflow-hidden bg-card">
        <Image source={{ uri: photoUri }} className="w-full h-full" contentFit="cover" />
      </View>
      <View className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green border-2 border-bg" />
    </View>
  );
}

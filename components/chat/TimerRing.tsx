import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { AvatarImage } from '@/components/ui/AvatarImage';

const PRESETS = {
  large: { outer: 88, avatar: 72, stroke: 3, showOnline: true },
  compact: { outer: 36, avatar: 28, stroke: 2, showOnline: false },
} as const;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TimerRing({
  photoUri,
  progress,
  color,
  variant = 'large',
}: {
  photoUri: string;
  progress: number;
  color: string;
  variant?: keyof typeof PRESETS;
}) {
  const { outer, avatar, stroke, showOnline } = PRESETS[variant];
  const R = (outer - stroke) / 2;
  const circ = useMemo(() => 2 * Math.PI * R, [R]);
  const offsetSv = useSharedValue(circ * (1 - progress));

  useEffect(() => {
    offsetSv.value = withTiming(circ * (1 - progress), {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, circ, offsetSv]);

  /** Negatives Offset: Restzeit läuft im Uhrzeigersinn ab (Start oben, rotation -90). */
  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: -offsetSv.value,
  }));

  const half = outer / 2;

  return (
    <View
      style={{
        width: outer,
        height: outer,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={outer} height={outer} style={{ position: 'absolute' }}>
        <Circle
          cx={half}
          cy={half}
          r={R}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={half}
          cy={half}
          r={R}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={circleProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${half}, ${half}`}
        />
      </Svg>
      <AvatarImage
        uri={photoUri}
        size={avatar}
        recyclingKey={`timer-${variant}-${photoUri}`}
      />
      {showOnline ? (
        <View
          className="absolute bg-green border-2 border-bg rounded-full"
          style={{
            width: 14,
            height: 14,
            bottom: variant === 'large' ? 4 : 0,
            right: variant === 'large' ? 4 : 0,
          }}
        />
      ) : null}
    </View>
  );
}

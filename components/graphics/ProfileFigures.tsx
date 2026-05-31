import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { accentRgba, FLING_COLORS } from '@/lib/designTokens';

const STROKE = FLING_COLORS.accent;
const STROKE_SOFT = FLING_COLORS.accent2;
const GOLD = FLING_COLORS.gold;

type Props = { size?: number; animate?: boolean };

function useBreathe(enabled: boolean) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (!enabled) return;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [enabled, scale]);

  return style;
}

function useGoldPulse(enabled: boolean) {
  const opacity = useSharedValue(0.55);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    if (!enabled) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [enabled, opacity]);

  return style;
}

/** A · Sehnsucht — zurückgelehnt (Auswahl leer, Splash, Onboarding Frau) */
export function ProfileFigureBack({ size = 200, animate = true }: Props) {
  const breathe = useBreathe(animate);
  const w = size;
  const h = size * (220 / 240);

  return (
    <Animated.View style={breathe}>
      <Svg width={w} height={h} viewBox="0 0 240 220">
        <G transform="rotate(-16 120 120)">
          <Path
            d="M120 52 C 96 54 82 78 86 112 C 88 130 96 144 108 154"
            fill="none"
            stroke={STROKE}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Path
            d="M120 52 C 142 52 156 66 158 88 C 159 98 151 102 161 108 C 168 113 167 118 156 122 C 151 126 157 129 151 133 C 158 136 157 143 147 145 C 142 152 145 158 136 161 C 133 174 136 186 129 198"
            fill="none"
            stroke={STROKE}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M133 86 C 139 83 145 84 149 88"
            fill="none"
            stroke={STROKE}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Path
            d="M151 126 C 157 125 160 128 157 132"
            fill="none"
            stroke={STROKE_SOFT}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </G>
        <Circle cx={190} cy={66} r={4} fill={GOLD} opacity={0.9} />
      </Svg>
    </Animated.View>
  );
}

/** B · Zwei · Nähe — Match / Verifiziert / Pick leer (Frau) */
export function ProfileFigureTwo({ size = 200, animate = true }: Props) {
  const goldStyle = useGoldPulse(animate);
  const w = size;
  const h = size;

  return (
    <Animated.View style={goldStyle}>
      <Svg width={w} height={h} viewBox="0 0 220 220">
        <Path
          d="M70 40 C 58 52 56 70 64 84 C 70 94 66 104 60 112 C 54 120 56 132 66 138 C 78 145 84 158 84 180"
          fill="none"
          stroke={STROKE}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <Path
          d="M150 40 C 162 52 164 70 156 84 C 150 94 154 104 160 112 C 166 120 164 132 154 138 C 142 145 136 158 136 180"
          fill="none"
          stroke={STROKE_SOFT}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <Path
          d="M84 96 C 92 92 96 96 92 102"
          fill="none"
          stroke={STROKE}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M136 96 C 128 92 124 96 128 102"
          fill="none"
          stroke={STROKE_SOFT}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Circle cx={110} cy={100} r={4} fill={GOLD} />
      </Svg>
    </Animated.View>
  );
}

/** C · Wartende — Mann im Schaufenster / Onboarding Mann */
export function ProfileFigureWait({ size = 200 }: Props) {
  const w = size * (200 / 200);
  const h = size * (220 / 200);

  return (
    <Svg width={w} height={h} viewBox="0 0 200 220">
      <Circle
        cx={100}
        cy={118}
        r={82}
        fill="none"
        stroke={accentRgba(0.16)}
        strokeWidth={1}
      />
      <Circle
        cx={100}
        cy={118}
        r={58}
        fill="none"
        stroke={accentRgba(0.1)}
        strokeWidth={1}
      />
      <Path
        d="M92 56 C 70 58 58 82 62 116 C 64 134 72 148 86 158"
        fill="none"
        stroke={STROKE}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Path
        d="M92 56 C 114 56 128 72 130 96 C 131 107 123 111 134 117 C 141 122 140 128 128 132 C 123 137 129 140 123 145 C 117 152 120 158 110 161 C 106 176 110 188 102 200"
        fill="none"
        stroke={STROKE}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M104 92 C 110 89 117 90 121 95"
        fill="none"
        stroke={STROKE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={100} cy={118} r={4} fill={GOLD} />
    </Svg>
  );
}

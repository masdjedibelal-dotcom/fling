import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

const BAR_COUNT = 40;
const BAR_W = 3;
const BAR_GAP = 3;
const WAVE_H = 32;

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Props = {
  active: boolean;
  /** 0–1, aus Mikrofon-Metering */
  meterLevel?: number;
  startedAt?: number;
  maxDurationMs?: number;
};

export function VoiceRecordingWaveform({
  active,
  meterLevel = 0.35,
  startedAt,
  maxDurationMs,
}: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bars, setBars] = useState(() => Array(BAR_COUNT).fill(0.2));
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      setElapsedMs(0);
      setBars(Array(BAR_COUNT).fill(0.2));
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 520 }),
        withTiming(1, { duration: 520 }),
      ),
      -1,
      true,
    );

    const tick = setInterval(() => {
      const t = Date.now();
      if (startedAt) setElapsedMs(Math.max(0, t - startedAt));
      const amp = 0.18 + Math.min(1, Math.max(0.12, meterLevel)) * 0.72;
      setBars(
        Array.from({ length: BAR_COUNT }, (_, i) => {
          const phase = t / 110 + i * 0.52;
          const wiggle = Math.sin(phase) * 0.22 + Math.sin(phase * 2.3) * 0.1;
          const edge = 1 - Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
          return Math.min(1, Math.max(0.1, (amp + wiggle) * (0.55 + edge * 0.45)));
        }),
      );
    }, 70);

    return () => clearInterval(tick);
  }, [active, meterLevel, startedAt, pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.85 + (pulse.value - 1) * 2,
  }));

  const barStripWidth = useMemo(
    () => BAR_COUNT * BAR_W + (BAR_COUNT - 1) * BAR_GAP,
    [],
  );

  if (!active) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(160)}
      exiting={FadeOut.duration(120)}
      style={styles.wrap}
    >
      <Animated.View style={[styles.recDot, dotStyle]} />
      <View style={styles.waveTrack}>
        <View style={[styles.waveRow, { width: barStripWidth }]}>
          {bars.map((h, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.max(4, h * WAVE_H),
                  opacity: 0.45 + h * 0.55,
                },
              ]}
            />
          ))}
        </View>
      </View>
      <Text
        style={[
          styles.timer,
          maxDurationMs != null &&
            elapsedMs >= maxDurationMs - 400 &&
            styles.timerAtLimit,
        ]}
      >
        {formatElapsed(
          maxDurationMs != null
            ? Math.min(elapsedMs, maxDurationMs)
            : elapsedMs,
        )}
        {maxDurationMs != null
          ? ` / ${formatElapsed(maxDurationMs)}`
          : ''}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
    backgroundColor: 'transparent',
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FLING_COLORS.accent,
    flexShrink: 0,
  },
  waveTrack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  timer: {
    color: FLING_COLORS.gold,
    fontSize: FLING_TYPE.caption,
    fontFamily: 'JetBrainsMono_500Medium',
    letterSpacing: 0.5,
    flexShrink: 0,
    minWidth: 52,
    textAlign: 'right',
  },
  timerAtLimit: {
    color: FLING_COLORS.accent,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: WAVE_H,
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_W,
    borderRadius: 2,
    backgroundColor: FLING_COLORS.accent,
  },
});

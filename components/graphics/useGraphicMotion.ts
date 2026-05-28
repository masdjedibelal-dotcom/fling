import { useEffect } from 'react';
import {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function usePulse(duration = 2600) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.95);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [duration, opacity, scale]);

  return { scale, opacity };
}

export function useRipple(delayMs: number, duration = 3200) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, [delayMs, duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    r: 14 + progress.value * 82,
    opacity: 0.7 * (1 - progress.value),
  }));

  return animatedProps;
}

export function useScatter(delayMs: number, duration = 5000) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, duration, t]);

  return t;
}

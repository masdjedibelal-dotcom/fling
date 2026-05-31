import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  Easing,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { KEYBOARD_COMPOSER_GAP } from '@/lib/chatLayout';

const WEB_ANIM_MS = 220;

function useScrollOnKeyboardShift(onLayoutShift?: () => void) {
  const onShiftRef = useRef(onLayoutShift);
  onShiftRef.current = onLayoutShift;
  const rafRef = useRef<number | null>(null);

  const notifyShift = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      onShiftRef.current?.();
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return notifyShift;
}

/** Native: Reanimated folgt iOS/Android-Tastatur. Web: weiches Timing via visualViewport. */
export function useChatKeyboard(onLayoutShift?: () => void) {
  const nativeKb = useAnimatedKeyboard({
    isStatusBarTranslucentAndroid: true,
  });
  const webHeight = useSharedValue(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const notifyShift = useScrollOnKeyboardShift(onLayoutShift);

  const keyboardHeight = useDerivedValue(() =>
    Platform.OS === 'web' ? webHeight.value : nativeKb.height.value,
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;

    const apply = (target: number) => {
      webHeight.value = withTiming(target, {
        duration: WEB_ANIM_MS,
        easing: Easing.out(Easing.cubic),
      });
    };

    const update = () => {
      const gap = Math.max(0, window.innerHeight - vv.height);
      apply(gap > 40 ? gap : 0);
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [webHeight]);

  useAnimatedReaction(
    () => keyboardHeight.value > 24,
    (open, prev) => {
      if (prev === null || open !== prev) {
        runOnJS(setKeyboardOpen)(open);
      }
    },
    [keyboardHeight],
  );

  useAnimatedReaction(
    () => Math.round(keyboardHeight.value),
    (cur, prev) => {
      if (prev !== null && cur !== prev) {
        runOnJS(notifyShift)();
      }
    },
    [keyboardHeight],
  );

  const bodyStyle = useAnimatedStyle(() => {
    const h = keyboardHeight.value;
    return {
      paddingBottom: h > 0 ? h + KEYBOARD_COMPOSER_GAP : 0,
    };
  });

  return { keyboardHeight, bodyStyle, webHeight, keyboardOpen };
}

/** Web: Fokus synchronisiert visualViewport schneller */
export function useChatKeyboardWebFocusHandlers(webHeight: SharedValue<number>) {
  const onInputFocus = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const sync = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const gap = Math.max(0, window.innerHeight - vv.height);
      if (gap > 20) {
        webHeight.value = withTiming(gap, {
          duration: WEB_ANIM_MS,
          easing: Easing.out(Easing.cubic),
        });
      }
    };
    sync();
    requestAnimationFrame(sync);
  }, [webHeight]);

  const onInputBlur = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    setTimeout(() => {
      const vv = window.visualViewport;
      const gap = vv ? Math.max(0, window.innerHeight - vv.height) : 0;
      if (gap < 50) {
        webHeight.value = withTiming(0, {
          duration: WEB_ANIM_MS,
          easing: Easing.out(Easing.cubic),
        });
      }
    }, 120);
  }, [webHeight]);

  return { onInputFocus, onInputBlur };
}

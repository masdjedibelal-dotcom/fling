import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TOUCH } from '@/lib/designTokens';

const SIZE = 64;
const FAB_RIGHT = 16;
/** Gedrückthalten bis Explosion — durchgehend wachsend, ~3,2 s */
export const PICK_HOLD_MS = 3200;
const TAP_MAX_MS = 280;
/** Icon wächst spürbar mit (~6 % der Button-Skalierung), bleibt aber deutlich kleiner. */
const ICON_BTN_GROW = 0.06;

const PICK_COLOR_START = FLING_COLORS.accent;
const PICK_COLOR_MID = FLING_COLORS.accentD;
const PICK_COLOR_LATE = FLING_COLORS.bg2;
const PICK_COLOR_END = FLING_COLORS.bg;

type Props = {
  disabled?: boolean;
  onTap: () => void;
  onHoldComplete: () => void;
  bottomInset?: number;
};

function stageHaptic() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/** Kontinuierlich, 3 Beschleunigungsphasen — ohne Pause. */
function pickHoldEase(t: number): number {
  'worklet';
  if (t <= 0.33) {
    return 0.14 * Easing.out(Easing.quad)(t / 0.33);
  }
  if (t <= 0.66) {
    const u = (t - 0.33) / 0.33;
    return 0.14 + 0.3 * Easing.out(Easing.quad)(u);
  }
  const u = (t - 0.66) / 0.34;
  return 0.44 + 0.56 * Easing.in(Easing.cubic)(u);
}

function coverScale(
  hostW: number,
  hostH: number,
  bottomInset: number,
): number {
  const cx = hostW - FAB_RIGHT - SIZE / 2;
  const cy = hostH - bottomInset - SIZE / 2;
  const corners = [
    Math.hypot(cx, cy),
    Math.hypot(hostW - cx, cy),
    Math.hypot(cx, hostH - cy),
    Math.hypot(hostW - cx, hostH - cy),
  ];
  const maxDist = Math.max(...corners) + 12;
  return (maxDist * 2) / SIZE;
}

export function PickFab({
  disabled,
  onTap,
  onHoldComplete,
  bottomInset = 16,
}: Props) {
  const progress = useSharedValue(0);
  const maxScaleSv = useSharedValue(28);
  const pressedAt = useRef(0);
  const holdTriggered = useRef(false);
  const hapticTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [hostSize, setHostSize] = useState({ w: 0, h: 0 });

  const maxScale = useMemo(() => {
    if (hostSize.w <= 0 || hostSize.h <= 0) return 28;
    return coverScale(hostSize.w, hostSize.h, bottomInset);
  }, [hostSize.w, hostSize.h, bottomInset]);

  useEffect(() => {
    maxScaleSv.value = maxScale;
  }, [maxScale, maxScaleSv]);

  const triggerHoldComplete = () => {
    if (holdTriggered.current) return;
    holdTriggered.current = true;
    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onHoldComplete();
    setTimeout(() => {
      holdTriggered.current = false;
    }, 800);
  };

  useAnimatedReaction(
    () => progress.value,
    (v, prev) => {
      if (v >= 1 && (prev ?? 0) < 1) {
        runOnJS(triggerHoldComplete)();
      }
    },
  );

  useEffect(
    () => () => {
      hapticTimers.current.forEach(clearTimeout);
    },
    [],
  );

  useEffect(() => {
    if (!disabled) return;
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 140 });
  }, [disabled, progress]);

  const startHold = () => {
    if (disabled) return;
    pressedAt.current = Date.now();
    holdTriggered.current = false;
    hapticTimers.current.forEach(clearTimeout);
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: PICK_HOLD_MS,
      easing: pickHoldEase,
    });
    hapticTimers.current = [
      setTimeout(stageHaptic, PICK_HOLD_MS * 0.34),
      setTimeout(stageHaptic, PICK_HOLD_MS * 0.68),
    ];
  };

  const endHold = () => {
    if (disabled) return;
    hapticTimers.current.forEach(clearTimeout);
    const heldMs = Date.now() - pressedAt.current;
    cancelAnimation(progress);
    const current = progress.value;

    if (current < 0.92 && heldMs < TAP_MAX_MS) {
      progress.value = withTiming(0, { duration: 120 });
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onTap();
      return;
    }

    if (current < 0.92) {
      progress.value = withTiming(0, { duration: 160 });
    }
  };

  /** Der Button skaliert — Farbe von Hell (Crimson) zu Dunkel (App-Hintergrund). */
  const btnStyle = useAnimatedStyle(() => {
    const eased = Math.min(1, Math.max(0, progress.value));
    const scale = 1 + (maxScaleSv.value - 1) * eased;
    return {
      transform: [{ scale }],
      backgroundColor: interpolateColor(
        eased,
        [0, 0.28, 0.62, 1],
        [PICK_COLOR_START, PICK_COLOR_MID, PICK_COLOR_LATE, PICK_COLOR_END],
      ),
      borderColor: interpolateColor(
        eased,
        [0, 0.5, 1],
        ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0)'],
      ),
      borderWidth: interpolate(eased, [0, 0.85, 1], [2, 1, 0]),
      shadowOpacity: interpolate(eased, [0, 0.18, 1], [0.5, 0, 0]),
      elevation: interpolate(eased, [0, 0.18, 1], [8, 0, 0]),
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const eased = Math.min(1, Math.max(0, progress.value));
    const btnScale = 1 + (maxScaleSv.value - 1) * eased;
    const iconScale = 1 + (btnScale - 1) * ICON_BTN_GROW;
    return {
      transform: [{ scale: iconScale }],
      opacity: interpolate(eased, [0, 0.82, 1], [1, 1, 0]),
    };
  });

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setHostSize((prev) =>
            prev.w === width && prev.h === height
              ? prev
              : { w: width, h: height },
          );
        }
      }}
    >
      <View
        pointerEvents="box-none"
        style={[styles.anchor, { right: FAB_RIGHT, bottom: bottomInset }]}
      >
        <Pressable
          disabled={disabled}
          onPressIn={startHold}
          onPressOut={endHold}
          accessibilityRole="button"
          accessibilityLabel="Pick — tippen zum Bestätigen, gedrückt halten"
          style={styles.hit}
        >
          <Animated.View
            style={[
              styles.btn,
              btnStyle,
              disabled ? styles.btnDisabled : null,
            ]}
          />
        </Pressable>
        <Animated.View style={[styles.iconLayer, iconStyle]} pointerEvents="none">
          <FlingIcon name="pick" size={26} color="#fff" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    zIndex: 50,
    elevation: 50,
    overflow: 'visible',
  },
  hit: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  btn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: FLING_TOUCH.min,
    minHeight: FLING_TOUCH.min,
    shadowColor: FLING_COLORS.accent,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  btnDisabled: { opacity: 0.45 },
  iconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});

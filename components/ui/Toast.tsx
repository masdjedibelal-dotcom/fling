import { useEffect } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLING_COLORS, FLING_RADIUS, FLING_TYPE } from '@/lib/designTokens';

type Props = {
  message: string | null;
  onHidden?: () => void;
  durationMs?: number;
};

/** Kurze Bestätigung (z. B. „Gemeldet“) — ohne Modal */
export function Toast({ message, onHidden, durationMs = 2200 }: Props) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    if (!message) return;
    opacity.value = withTiming(1, { duration: 180 });
    translateY.value = withTiming(0, { duration: 180 });
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished && onHidden) runOnJS(onHidden)();
      });
      translateY.value = withTiming(8, { duration: 200 });
    }, durationMs);
    return () => clearTimeout(t);
  }, [message, durationMs, onHidden, opacity, translateY]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { top: insets.top + (Platform.OS === 'web' ? 12 : 8) },
        anim,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    elevation: 9999,
    maxWidth: '88%',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: FLING_RADIUS.md,
    backgroundColor: FLING_COLORS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FLING_COLORS.line2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: FLING_TYPE.subhead,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});

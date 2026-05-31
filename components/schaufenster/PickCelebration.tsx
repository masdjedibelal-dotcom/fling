import { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';
import { PICK_CELEBRATION } from '@/lib/marketingCopy';

type Props = {
  visible: boolean;
  partnerName?: string;
  onFinished: () => void;
};

/**
 * Pick-Hold endet im App-Hintergrund — hier nur Text einblenden.
 */
export function PickCelebration({
  visible,
  partnerName,
  onFinished,
}: Props) {
  const insets = useSafeAreaInsets();
  const wash = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.94);
  const finishedRef = useRef(onFinished);
  finishedRef.current = onFinished;

  useEffect(() => {
    if (!visible) {
      wash.value = 0;
      textOpacity.value = 0;
      textScale.value = 0.94;
      return;
    }

    wash.value = 1;

    textOpacity.value = withDelay(
      90,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
    );
    textScale.value = withDelay(
      90,
      withSequence(
        withTiming(1.03, { duration: 220, easing: Easing.out(Easing.back(1.3)) }),
        withTiming(1, { duration: 130 }),
      ),
    );

    const t = setTimeout(() => {
      finishedRef.current();
    }, 1750);

    return () => clearTimeout(t);
  }, [visible, wash, textOpacity, textScale]);

  const washStyle = useAnimatedStyle(() => ({
    opacity: wash.value,
  }));

  const textWrapStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.wash, washStyle]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            styles.textWrap,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
            textWrapStyle,
          ]}
        >
          <Text style={styles.line1}>{PICK_CELEBRATION.line1}</Text>
          <Text style={styles.line2}>{PICK_CELEBRATION.line2}</Text>
          {partnerName ? (
            <Text style={styles.line3}>{partnerName}</Text>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  wash: {
    backgroundColor: FLING_COLORS.bg,
  },
  textWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  line1: {
    color: '#fff',
    fontSize: FLING_TYPE.title,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10,
    ...(Platform.OS === 'web' ? { textShadow: '0 2px 24px rgba(0,0,0,0.35)' } : {}),
  },
  line2: {
    color: '#fff',
    fontSize: FLING_TYPE.displayHero,
    fontFamily: 'Unbounded_700Bold',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  line3: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: FLING_TYPE.bodyLarge,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginTop: 6,
  },
});

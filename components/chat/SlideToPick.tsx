import { View } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_TYPE } from '@/lib/designTokens';

const TRACK_H = 56;
const HANDLE = 48;
const HANDLE_INSET = 4;
/** Schmaler als volle Breite — zentriert unter dem Profil */
const TRACK_WIDTH_RATIO = 0.78;
const TRACK_MAX_WIDTH = 320;

export function SlideToPick({ onPick }: { onPick: () => void }) {
  const { width: screenWidth } = useAppDimensions();
  const trackW = Math.min(screenWidth * TRACK_WIDTH_RATIO, TRACK_MAX_WIDTH);
  const maxX = trackW - HANDLE - HANDLE_INSET * 2;
  const x = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = Math.max(0, Math.min(e.translationX, maxX));
    })
    .onEnd(() => {
      if (x.value > maxX * 0.55) {
        runOnJS(onPick)();
      }
      x.value = withSpring(0, { damping: 18, stiffness: 220 });
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: HANDLE + x.value + HANDLE_INSET,
    backgroundColor: interpolateColor(
      x.value,
      [0, maxX],
      ['#1a0f12', '#E11539'],
    ),
    opacity: interpolate(x.value, [0, maxX], [0.35, 1]),
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, maxX * 0.4], [0.55, 0.2]),
  }));

  return (
    <View className="items-center px-4">
      <View
        style={{
          width: trackW,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          backgroundColor: 'rgba(20,18,16,0.92)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              borderRadius: TRACK_H / 2,
            },
            fillStyle,
          ]}
        />
        <Animated.Text
          style={[
            {
              position: 'absolute',
              width: trackW,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.75)',
              fontSize: FLING_TYPE.subhead,
              fontWeight: '600',
              letterSpacing: 0.3,
              paddingLeft: HANDLE + 4,
            },
            labelStyle,
          ]}
        >
          Nach rechts wischen für Pick ›››
        </Animated.Text>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: HANDLE_INSET,
                left: HANDLE_INSET,
                width: HANDLE,
                height: HANDLE,
                borderRadius: HANDLE / 2,
                backgroundColor: '#E11539',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#E11539',
                shadowOpacity: 0.45,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              },
              handleStyle,
            ]}
          >
            <FlingIcon name="pick" size={20} color="#fff" />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

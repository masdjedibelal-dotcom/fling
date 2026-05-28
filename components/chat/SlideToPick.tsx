import { View, Text, useWindowDimensions } from 'react-native';
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

const PAD = 16;
const TRACK_H = 44;
const HANDLE = 40;

export function SlideToPick({ onPick }: { onPick: () => void }) {
  const { width } = useWindowDimensions();
  const trackW = width - PAD * 2;
  const maxX = trackW - HANDLE - 6;
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
    width: HANDLE + x.value + 4,
    backgroundColor: interpolateColor(
      x.value,
      [0, maxX],
      ['#141210', '#D11537'],
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
    <View style={{ paddingHorizontal: PAD }}>
      <View
        style={{
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
              width: '100%',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              paddingLeft: HANDLE,
            },
            labelStyle,
          ]}
        >
          Wischen zum Picken ›››
        </Animated.Text>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 2,
                left: 2,
                width: HANDLE,
                height: HANDLE,
                borderRadius: HANDLE / 2,
                backgroundColor: '#D11537',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#D11537',
                shadowOpacity: 0.45,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
              },
              handleStyle,
            ]}
          >
            <FlingIcon name="pick" size={17} color="#fff" />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

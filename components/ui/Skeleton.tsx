import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export function ShimmerBox({
  className,
  style,
}: {
  className?: string;
  style?: object;
}) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 900 }), -1, true);
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={animStyle}
      className={`bg-card rounded-md ${className ?? ''}`}
    />
  );
}

export function GridSkeleton() {
  return (
    <View className="flex-row gap-1 px-1 flex-1">
      {[0, 1, 2].map((col) => (
        <View key={col} className={`flex-1 gap-1 ${col === 1 ? 'mt-12' : ''}`}>
          <ShimmerBox className="aspect-[3/4] w-full" />
          <ShimmerBox className="aspect-[4/5] w-full" />
        </View>
      ))}
    </View>
  );
}

import { useEffect } from 'react';
import { View } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
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

const SKELETON_RATIOS = [3 / 4, 3 / 5.5, 4 / 5] as const;

export function GridSkeleton() {
  const { width: screenWidth } = useAppDimensions();
  const colWidth = Math.floor((screenWidth - 8 * 2 - 8 * 2) / 3);
  const stagger = Math.round(colWidth * 0.42);

  return (
    <View className="flex-row px-2 gap-2 flex-1">
      {[0, 1, 2].map((col) => (
        <View
          key={col}
          style={{
            width: colWidth,
            flexShrink: 0,
            gap: 8,
            paddingTop: col === 1 ? stagger : 0,
          }}
        >
          <ShimmerBox style={{ width: colWidth, aspectRatio: SKELETON_RATIOS[col % 3] }} />
          <ShimmerBox
            style={{ width: colWidth, aspectRatio: SKELETON_RATIOS[(col + 1) % 3] }}
          />
        </View>
      ))}
    </View>
  );
}

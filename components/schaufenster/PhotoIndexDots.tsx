import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const DOT_H = 4;
const DOT_ACTIVE = 18;
const DOT_IDLE = 6;

function Dot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? DOT_ACTIVE : DOT_IDLE);
  const opacity = useSharedValue(active ? 1 : 0.35);

  useEffect(() => {
    width.value = withTiming(active ? DOT_ACTIVE : DOT_IDLE, { duration: 200 });
    opacity.value = withTiming(active ? 1 : 0.35, { duration: 200 });
  }, [active, width, opacity]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.dot, style, styles.dotBg]} />
  );
}

export function PhotoIndexDots({
  count,
  activeIndex,
  top,
}: {
  count: number;
  activeIndex: number;
  top: number;
}) {
  if (count <= 1) return null;

  return (
    <View pointerEvents="none" style={[styles.row, { top }]}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  dot: {
    height: DOT_H,
    borderRadius: DOT_H / 2,
  },
  dotBg: {
    backgroundColor: '#fff',
  },
});

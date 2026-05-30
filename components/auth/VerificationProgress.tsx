import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FLING_TYPE, FLING_COLORS } from '@/lib/designTokens';

interface VerificationProgressProps {
  total: number;
  current: number;
  label: string;
}

function StepDot({ done, curr }: { done: boolean; curr: boolean }) {
  const scale = useSharedValue(curr ? 1.35 : 1);

  useEffect(() => {
    scale.value = withSpring(curr ? 1.35 : done ? 1.1 : 1, {
      damping: 14,
      stiffness: 280,
    });
  }, [curr, done, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1,
          backgroundColor: done
            ? 'rgba(255,255,255,0.7)'
            : curr
              ? FLING_COLORS.accent
              : 'transparent',
          borderColor: done
            ? 'rgba(255,255,255,0.7)'
            : curr
              ? FLING_COLORS.accent
              : 'rgba(255,255,255,0.2)',
          shadowColor: curr ? FLING_COLORS.accent : 'transparent',
          shadowOpacity: curr ? 0.35 : 0,
          shadowRadius: 8,
        },
        style,
      ]}
    />
  );
}

export function VerificationProgress({
  total,
  current,
  label,
}: VerificationProgressProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2.5">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const done = step < current;
          const curr = step === current;
          return (
            <View key={step} className="flex-row items-center gap-2.5 flex-1">
              <StepDot done={done} curr={curr} />
              {i < total - 1 ? (
                <View className="flex-1 h-px bg-line max-w-6" />
              ) : null}
            </View>
          );
        })}
      </View>
      <Text className="text-fg-3" style={{ fontSize: FLING_TYPE.caption }}>
        <Text className="text-white font-semibold">
          Schritt {String(current).padStart(2, '0')}
        </Text>
        {' · '}
        von {String(total).padStart(2, '0')} · {label}
      </Text>
    </View>
  );
}

import { View, Text } from 'react-native';
import { FLING_TYPE } from '@/lib/designTokens';
import { StepLabel } from '@/components/ui/Typography';
import { FLING_COLORS } from '@/lib/designTokens';

interface VerificationProgressProps {
  total: number;
  current: number;
  label: string;
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
              <View
                className={`w-2 h-2 rounded-full border ${
                  done
                    ? 'bg-white/70 border-white/70'
                    : curr
                      ? 'bg-accent border-accent'
                      : 'bg-transparent border-white/20'
                }`}
                style={
                  curr
                    ? {
                        shadowColor: FLING_COLORS.accent,
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                      }
                    : undefined
                }
              />
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

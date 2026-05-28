import { View } from 'react-native';
import { MetaText } from '@/components/ui/Typography';

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
    <View className="gap-5">
      <View className="flex-row items-center gap-2.5">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const done = step < current;
          const curr = step === current;
          return (
            <View key={step} className="flex-row items-center gap-2.5 flex-1">
              <View
                className={`w-[7px] h-[7px] rounded-full border ${
                  done
                    ? 'bg-white/70 border-white/70'
                    : curr
                      ? 'bg-accent border-accent'
                      : 'bg-transparent border-white/20'
                }`}
                style={
                  curr
                    ? {
                        shadowColor: '#D11537',
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
      <MetaText className="text-fg-3 normal-case tracking-wide text-[11px]">
        <MetaText className="text-white font-bold">Schritt {String(current).padStart(2, '0')}</MetaText>
        {' · '}von {String(total).padStart(2, '0')} · {label}
      </MetaText>
    </View>
  );
}

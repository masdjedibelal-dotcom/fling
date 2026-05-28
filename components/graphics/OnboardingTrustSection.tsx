import { View } from 'react-native';
import { BodyText } from '@/components/ui/Typography';
import { SafePickMark } from './SafePickMark';
import { DiscretionMark } from './DiscretionMark';

export function OnboardingTrustSection() {
  return (
    <View className="mt-4 rounded-xl border border-line bg-card/40 p-4">
      <View className="flex-row justify-around items-center mb-3">
        <SafePickMark size={64} />
        <DiscretionMark size={64} />
      </View>
      <BodyText className="text-center text-fg-3 text-[12px] leading-5">
        Safe Pick & Diskretion — Schutz ohne Drama. Keine Spuren nach 24 Stunden.
      </BodyText>
    </View>
  );
}

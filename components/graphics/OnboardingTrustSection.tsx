import { View } from 'react-native';
import { BodyLarge } from '@/components/ui/Typography';
import { DiscretionMark } from './DiscretionMark';

export function OnboardingTrustSection() {
  return (
    <View className="mt-4 rounded-xl border border-line bg-card/40 p-4">
      <View className="items-center mb-3">
        <DiscretionMark size={64} />
      </View>
      <BodyLarge className="text-center text-fg-3 leading-7 px-1">
        Diskretion — Schutz ohne Drama. Keine Spuren nach 24 Stunden.
      </BodyLarge>
    </View>
  );
}

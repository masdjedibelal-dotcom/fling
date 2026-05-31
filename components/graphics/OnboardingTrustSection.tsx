import { View } from 'react-native';
import { BodyLarge } from '@/components/ui/Typography';
import { TRUST_COPY } from '@/lib/marketingCopy';
import { DiscretionMark } from './DiscretionMark';

export function OnboardingTrustSection() {
  return (
    <View className="mt-4 rounded-xl border border-line bg-card/40 p-4">
      <View className="items-center mb-3">
        <DiscretionMark size={64} />
      </View>
      <BodyLarge className="text-center text-fg-3 leading-7 px-1">
        {TRUST_COPY}
      </BodyLarge>
    </View>
  );
}

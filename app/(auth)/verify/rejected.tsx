import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { REJECTION_COPY } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

export default function RejectedScreen() {
  const gender = useAuthStore((s) => s.gender);
  const reason = useAuthStore((s) => s.rejectionReason) ?? 'id_blurry';
  const copy = REJECTION_COPY[reason];

  return (
    <Screen className="px-5 pt-2 pb-6">
      <BodyText className="mt-6 text-accent font-bold uppercase tracking-wide text-[11px]">
        Schritt 02 · Erneut versuchen
      </BodyText>

      <View className="flex-1 items-center justify-center gap-4 px-2">
        <View className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 items-center justify-center">
          <Ionicons name="warning-outline" size={28} color="#D11537" />
        </View>
        <DisplayText className="text-[32px] text-center leading-tight">
          {copy.title.replace('\n', '\n')}
        </DisplayText>
        <BodyText className="text-center max-w-[280px]">{copy.subtitle}</BodyText>

        <View className="w-full max-w-[280px] p-4 bg-card border border-line rounded-md items-start">
          <BodyText className="text-fg-3 text-[11px] uppercase tracking-wider mb-2">
            Tipps
          </BodyText>
          {copy.hints.map((hint) => (
            <BodyText key={hint} className="text-fg-2 text-[13px] mb-1">
              · {hint}
            </BodyText>
          ))}
        </View>
      </View>

      <Button
        label="Erneut versuchen"
        onPress={() =>
          router.replace(
            gender === 'male'
              ? '/(auth)/verify/id-scan'
              : '/(auth)/verify/selfie',
          )
        }
      />
    </Screen>
  );
}

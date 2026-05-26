import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { VerificationProgress } from '@/components/auth/VerificationProgress';
import { useAuthStore } from '@/stores/authStore';
import { useVerificationSubscription } from '@/hooks/useVerificationSubscription';
import { isDemoMode } from '@/lib/demoMode';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';

export default function PendingScreen() {
  const gender = useAuthStore((s) => s.gender);
  const userId = useAuthStore((s) => s.userId);
  const totalSteps = gender === 'male' ? 3 : 2;

  useVerificationSubscription(userId);


  return (
    <Screen className="px-5 pt-2 pb-6">
      <View className="pt-4">
        <VerificationProgress total={totalSteps} current={totalSteps} label="läuft" />
        <MetaText className="mt-5 normal-case tracking-wide text-[11px]">
          <MetaText className="text-white font-bold">Verifikation</MetaText> · läuft
        </MetaText>
      </View>

      <View className="flex-1 items-center justify-center gap-4 px-2">
        <ActivityIndicator size="large" color="#D11537" />
        <DisplayText className="text-[32px] text-center leading-tight">
          Wir prüfen{'\n'}dein Selfie
        </DisplayText>
        <BodyText className="text-center max-w-[260px]">
          Das dauert in der Regel 1–3 Minuten. Wir benachrichtigen dich.
        </BodyText>

        <View className="w-full max-w-[260px] gap-1.5 mt-2">
          <StepRow done label="Telefonnummer bestätigt" />
          {gender === 'male' ? <StepRow done label="Ausweis verifiziert" /> : null}
          <StepRow current label="Live-Selfie wird geprüft…" />
        </View>
      </View>

      <Button
        label="App schließen · wir senden Push"
        variant="ghost"
        onPress={() => router.back()}
      />

      {isDemoMode ? <DemoShortcuts variant="pending" gender={gender ?? undefined} /> : null}
    </Screen>
  );
}

function StepRow({
  done,
  current,
  label,
}: {
  done?: boolean;
  current?: boolean;
  label: string;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 p-3 rounded-md border ${
        current ? 'border-accent/30 bg-accent/5' : 'border-line'
      }`}
    >
      <View
        className={`w-[18px] h-[18px] rounded-full border items-center justify-center ${
          done ? 'bg-white/70 border-white/70' : 'border-line-2'
        }`}
      >
        {done ? (
          <Ionicons name="checkmark" size={11} color="#000" />
        ) : current ? (
          <View className="w-[7px] h-[7px] rounded-full bg-accent" />
        ) : null}
      </View>
      <BodyText
        className={`text-[12.5px] ${current ? 'text-white' : done ? 'text-fg-2' : 'text-fg-3'}`}
      >
        {label}
      </BodyText>
    </View>
  );
}

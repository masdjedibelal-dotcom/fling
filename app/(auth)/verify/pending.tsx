import { View, ActivityIndicator, Text } from 'react-native';
import { router } from 'expo-router';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_RADIUS, FLING_TYPE } from '@/lib/designTokens';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { HeroText, BodyLarge, StepLabel } from '@/components/ui/Typography';
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
        <StepLabel className="mt-5">Verifikation läuft</StepLabel>
      </View>

      <View className="flex-1 items-center justify-center gap-5 px-2">
        <ActivityIndicator size="large" color={FLING_COLORS.accent} />
        <HeroText className="text-center">Wir prüfen{'\n'}dein Selfie</HeroText>
        <BodyLarge className="text-center max-w-[280px]">
          Meist 1–3 Minuten. Du bekommst eine Push, sobald du drin bist.
        </BodyLarge>

        <View className="w-full max-w-[300px] gap-2 mt-2">
          <StepRow done label="Telefon bestätigt" />
          {gender === 'male' ? <StepRow done label="Ausweis hochgeladen" /> : null}
          <StepRow current label="Live-Selfie wird geprüft" />
        </View>
      </View>

      <Button label="Schließen · Push folgt" variant="ghost" onPress={() => router.back()} />

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
      className={`flex-row items-center gap-3 px-4 py-3.5 border ${
        current ? 'border-accent/30 bg-accent/5' : 'border-line'
      }`}
      style={{ borderRadius: FLING_RADIUS.md, backgroundColor: FLING_COLORS.card }}
    >
      <View
        className={`w-5 h-5 rounded-full border items-center justify-center ${
          done ? 'bg-white/80 border-white/80' : 'border-line-2'
        }`}
      >
        {done ? (
          <FlingIcon name="check" size={12} color="#000" />
        ) : current ? (
          <View className="w-2 h-2 rounded-full bg-accent" />
        ) : null}
      </View>
      <Text
        className={`font-medium flex-1 ${current ? 'text-white' : 'text-fg-3'}`}
        style={{ fontSize: FLING_TYPE.subhead }}
      >
        {label}
      </Text>
    </View>
  );
}

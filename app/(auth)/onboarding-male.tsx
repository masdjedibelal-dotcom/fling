import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { StepLabel, MetaText } from '@/components/ui/Typography';
import { OnboardingCard, OnboardingPoint } from '@/components/auth/OnboardingCard';
import { useAuthStore } from '@/stores/authStore';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';
import { ONBOARDING_MALE_VERIFY } from '@/lib/marketingCopy';
import { OnboardingManGraphic, OnboardingTrustSection } from '@/components/graphics';

export default function OnboardingMaleScreen() {
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);

  return (
    <Screen className="px-5 pt-2 pb-6">
      <View className="flex-row items-center gap-2.5">
        <BackButton />
        <StepLabel>Schritt 1 / 2</StepLabel>
      </View>

      <OnboardingCard
        title={'Du\nwartest.'}
        body={ONBOARDING_MALE_VERIFY}
        graphic={<OnboardingManGraphic size={200} />}
      />

      <View className="mt-4 gap-3">
        <OnboardingPoint variant="accent" text="Max. 5 Fotos — Qualität vor Quantität" />
        <OnboardingPoint variant="accent" text="Du kannst nicht aktiv anschreiben" />
      </View>

      <OnboardingTrustSection />

      <View className="mt-auto gap-2.5">
        <Button
          label="Los geht's"
          onPress={() => {
            advanceOnboarding('verify');
            router.push('/(auth)/verify/phone');
          }}
        />
        <DemoShortcuts gender="male" />
        <MetaText className="text-center tracking-[1.5px]">
          3 Schritte · Phone · Ausweis · Selfie
        </MetaText>
      </View>
    </Screen>
  );
}

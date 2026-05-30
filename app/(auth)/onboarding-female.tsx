import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { StepLabel, MetaText } from '@/components/ui/Typography';
import { OnboardingCard, OnboardingPoint } from '@/components/auth/OnboardingCard';
import { useAuthStore } from '@/stores/authStore';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';
import {
  ONBOARDING_FEMALE_BODY,
  ONBOARDING_FEMALE_POINTS,
  ONBOARDING_FEMALE_TITLE,
} from '@/lib/marketingCopy';
import { ProfileFigureBack, OnboardingTrustSection } from '@/components/graphics';

export default function OnboardingFemaleScreen() {
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);

  return (
    <Screen className="px-5 pt-2 pb-6">
      <View className="flex-row items-center gap-2.5">
        <BackButton />
        <StepLabel>Schritt 1 / 2</StepLabel>
      </View>

      <OnboardingCard
        title={ONBOARDING_FEMALE_TITLE}
        body={ONBOARDING_FEMALE_BODY}
        graphic={<ProfileFigureBack size={180} />}
      />

      <View className="mt-4 gap-3">
        {ONBOARDING_FEMALE_POINTS.map((text) => (
          <OnboardingPoint key={text} variant="green" text={text} />
        ))}
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
        <DemoShortcuts gender="female" />
        <MetaText className="text-center tracking-[1.5px]">
          Telefon-Verifizierung folgt
        </MetaText>
      </View>
    </Screen>
  );
}

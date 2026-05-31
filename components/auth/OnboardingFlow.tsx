import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { StepLabel, MetaText } from '@/components/ui/Typography';
import { OnboardingCard, OnboardingPoint } from '@/components/auth/OnboardingCard';
import { OnboardingTrustSection } from '@/components/graphics';
import { useAuthStore } from '@/stores/authStore';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';
import type { ReactNode } from 'react';

type Step = {
  title: string;
  body: string;
  points?: readonly string[];
};

type Props = {
  steps: readonly Step[];
  graphic: (stepIndex: number) => ReactNode;
  finalLabel: string;
  finalMeta?: string;
  gender?: 'female' | 'male';
  showTrustOnLastStep?: boolean;
};

export function OnboardingFlow({
  steps,
  graphic,
  finalLabel,
  finalMeta,
  gender,
  showTrustOnLastStep = true,
}: Props) {
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isLast = index >= steps.length - 1;
  const total = steps.length;

  const goNext = () => {
    if (isLast) {
      advanceOnboarding('verify');
      router.push('/(auth)/verify/phone');
      return;
    }
    setIndex((i) => i + 1);
  };

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1);
    else router.back();
  };

  return (
    <Screen className="px-5 pt-2 pb-6">
      <View className="flex-row items-center gap-2.5">
        <BackButton onPress={goBack} />
        <StepLabel>
          Schritt {index + 1} / {total}
        </StepLabel>
      </View>

      <OnboardingCard
        title={step.title}
        body={step.body}
        graphic={graphic(index)}
      />

      {step.points && step.points.length > 0 ? (
        <View className="mt-4 gap-3">
          {step.points.map((text) => (
            <OnboardingPoint key={text} variant="accent" text={text} />
          ))}
        </View>
      ) : null}

      {isLast && showTrustOnLastStep ? <OnboardingTrustSection /> : null}

      <View className="mt-auto gap-2.5">
        <Button label={isLast ? finalLabel : 'Weiter'} onPress={goNext} />
        {gender ? <DemoShortcuts gender={gender} /> : null}
        {finalMeta && isLast ? (
          <MetaText className="text-center tracking-[1.5px]">{finalMeta}</MetaText>
        ) : null}
      </View>
    </Screen>
  );
}

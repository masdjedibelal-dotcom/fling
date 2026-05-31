import { ProfileFigureWait } from '@/components/graphics';
import { OnboardingFlow } from '@/components/auth/OnboardingFlow';
import { ONBOARDING_MALE_STEPS } from '@/lib/marketingCopy';

export default function OnboardingMaleScreen() {
  return (
    <OnboardingFlow
      steps={ONBOARDING_MALE_STEPS}
      graphic={() => <ProfileFigureWait size={160} />}
      finalLabel="Verifizierung starten"
      finalMeta="Phone · Ausweis · Selfie"
      gender="male"
    />
  );
}

import { ProfileFigureBack } from '@/components/graphics';
import { OnboardingFlow } from '@/components/auth/OnboardingFlow';
import { ONBOARDING_FEMALE_STEPS } from '@/lib/marketingCopy';

export default function OnboardingFemaleScreen() {
  return (
    <OnboardingFlow
      steps={ONBOARDING_FEMALE_STEPS}
      graphic={() => <ProfileFigureBack size={180} />}
      finalLabel="Los geht's"
      finalMeta="Telefon-Verifizierung folgt"
      gender="female"
    />
  );
}

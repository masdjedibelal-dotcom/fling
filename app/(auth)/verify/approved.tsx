import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { VerifiedStamp } from '@/components/graphics';

/** Kurzer Erfolgs-Screen nach Freischaltung (Demo / Deep-Link) */
export default function VerifyApprovedScreen() {
  return (
    <Screen className="px-5 items-center justify-center">
      <VerifiedStamp size={120} />
      <DisplayText className="text-[32px] text-center leading-tight mt-6 mb-3">
        Verifiziert
      </DisplayText>
      <BodyText className="text-center text-fg-3 max-w-[260px] mb-8 leading-6">
        Du bist freigeschaltet. Willkommen bei Fling.
      </BodyText>
      <Button label="Zur Auswahl" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

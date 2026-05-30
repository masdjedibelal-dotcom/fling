import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { HeroText, BodyLarge } from '@/components/ui/Typography';
import { ProfileFigureTwo } from '@/components/graphics';

export default function VerifyApprovedScreen() {
  return (
    <Screen className="px-6 items-center justify-center flex-1">
      <View className="mb-4" style={{ width: 150, height: 150 }}>
        <ProfileFigureTwo size={150} animate />
      </View>
      <HeroText className="text-center mb-3">Verifiziert</HeroText>
      <BodyLarge className="text-center max-w-[280px] mb-10 leading-7">
        Du bist im Schaufenster sichtbar. Stell deine Verfügbarkeit ein — der erste
        Pick kann jederzeit kommen.
      </BodyLarge>
      <Button label="Schaufenster öffnen" onPress={() => router.replace('/(tabs)')} />
    </Screen>
  );
}

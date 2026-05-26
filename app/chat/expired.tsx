import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { router } from 'expo-router';
import { clearDemoMatch } from '@/lib/demo';
import { EXPIRED_BODY } from '@/lib/marketingCopy';
import { ExpiredDissolveGraphic } from '@/components/graphics';

export default function ChatExpiredScreen() {
  return (
    <Screen className="items-center justify-center px-6">
      <View className="items-center justify-center mb-2" style={{ width: 280, height: 200 }}>
        <ExpiredDissolveGraphic size={280} />
        <DisplayText
          className="absolute text-[72px] font-extrabold text-white"
          style={{ letterSpacing: -4, top: 52 }}
        >
          00
        </DisplayText>
      </View>
      <DisplayText className="text-2xl text-center mb-3">
        Die 24 Stunden sind um
      </DisplayText>
      <BodyText className="text-center mb-2 max-w-[280px]">
        {EXPIRED_BODY}
      </BodyText>
      <BodyText className="text-fg-4 text-center text-xs mb-8">
        Markus ist 24 Stunden ausgeblendet
      </BodyText>
      <Button
        label="Zurück zur Auswahl"
        onPress={async () => {
          await clearDemoMatch();
          router.replace('/(tabs)');
        }}
      />
    </Screen>
  );
}

import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { HeroText, BodyLarge, MetaText } from '@/components/ui/Typography';
import { router } from 'expo-router';
import { clearDemoMatch } from '@/lib/demo';
import { EXPIRED_BODY, EXPIRED_TITLE } from '@/lib/marketingCopy';
import { ExpiredDissolveGraphic } from '@/components/graphics';

export default function ChatExpiredScreen() {
  return (
    <Screen className="items-center justify-center px-6">
      <View className="items-center justify-center mb-4" style={{ width: 280, height: 200 }}>
        <ExpiredDissolveGraphic size={280} />
      </View>
      <HeroText className="text-center mb-3">{EXPIRED_TITLE}</HeroText>
      <BodyLarge className="text-center mb-10 max-w-[300px] leading-7">{EXPIRED_BODY}</BodyLarge>
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

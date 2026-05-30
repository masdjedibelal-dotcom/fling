import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BodyLarge, MetaText } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';
import { WELCOME_TAGLINE } from '@/lib/marketingCopy';
import { ProfileFigureBack } from '@/components/graphics';
import { FLING_TYPE } from '@/lib/designTokens';
import type { Gender } from '@/lib/types';
import { Text } from 'react-native';

export default function WelcomeScreen() {
  const setGender = useAuthStore((s) => s.setGender);
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);

  const pickGender = (gender: Gender) => {
    setGender(gender);
    advanceOnboarding('onboarding');
    router.push(
      gender === 'female'
        ? '/(auth)/onboarding-female'
        : '/(auth)/onboarding-male',
    );
  };

  return (
    <Screen edges={['top', 'bottom']} className="overflow-hidden">
      <View className="absolute inset-0 items-center justify-start pt-20 opacity-30">
        <ProfileFigureBack size={200} animate={false} />
      </View>
      <View className="absolute inset-0 items-center justify-start pt-16">
        <View
          className="w-[320px] h-[320px] rounded-full"
          style={{
            backgroundColor: 'rgba(225,21,57,0.22)',
            transform: [{ translateY: -40 }],
          }}
        />
      </View>

      <View className="flex-1 px-7 pb-6 justify-between">
        <View className="items-center pt-12">
          <Text
            className="font-display text-white font-extrabold tracking-[-3px]"
            style={{ fontSize: FLING_TYPE.welcome, lineHeight: FLING_TYPE.welcome }}
          >
            Fling
          </Text>
          <MetaText className="text-accent mt-4 tracking-[4px]">
            Real · Now · Gone
          </MetaText>
        </View>

        <View className="items-center px-2">
          <BodyLarge className="text-center text-fg-2 leading-8 max-w-[320px]">
            {WELCOME_TAGLINE}
          </BodyLarge>
        </View>

        <View className="gap-3">
          <Button label="Ich bin eine Frau" onPress={() => pickGender('female')} />
          <Button
            label="Ich bin ein Mann"
            variant="ghost"
            onPress={() => pickGender('male')}
          />
          <DemoShortcuts />
          <MetaText className="text-center mt-2 tracking-wide normal-case text-fg-4">
            Ab 18 · Alle Profile verifiziert
          </MetaText>
        </View>
      </View>
    </Screen>
  );
}

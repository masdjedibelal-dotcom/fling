import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';
import { WELCOME_TAGLINE } from '@/lib/marketingCopy';
import type { Gender } from '@/lib/types';

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
      <View className="absolute inset-0 items-center justify-start pt-16">
        <View
          className="w-[320px] h-[320px] rounded-full"
          style={{
            backgroundColor: 'rgba(209,21,55,0.22)',
            transform: [{ translateY: -40 }],
          }}
        />
      </View>

      <View className="flex-1 px-7 pb-6 justify-between">
        <View className="items-center pt-12">
          <DisplayText className="text-[64px] font-extrabold tracking-[-3px] leading-none">
            Fling
          </DisplayText>
          <MetaText className="text-accent mt-3.5 tracking-[4px] text-[11px]">
            Real · Now · Gone
          </MetaText>
        </View>

        <View className="items-center px-2">
          <BodyText className="text-center text-fg-2 text-[17px] leading-7 max-w-[300px]">
            {WELCOME_TAGLINE}
          </BodyText>
        </View>

        <View className="gap-2.5">
          <Button label="Ich bin eine Frau" onPress={() => pickGender('female')} />
          <Button
            label="Ich bin ein Mann"
            variant="ghost"
            onPress={() => pickGender('male')}
          />
          <DemoShortcuts />
          <MetaText className="text-center mt-3.5 tracking-[1.5px]">
            Ab 18 · Alle Profile verifiziert
          </MetaText>
        </View>
      </View>
    </Screen>
  );
}

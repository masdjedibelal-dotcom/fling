import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CaptionText } from '@/components/ui/Typography';
import {
  isDemoMode,
  confirmDemoPhone,
  skipToApp,
  skipToApproved,
  skipVerificationSteps,
} from '@/lib/demoMode';
import type { Gender } from '@/lib/types';

type Variant = 'banner' | 'phone' | 'verify' | 'pending';

interface DemoShortcutsProps {
  variant?: Variant;
  gender?: Gender;
}

export function DemoShortcuts({ variant = 'banner', gender }: DemoShortcutsProps) {
  if (!__DEV__ || !isDemoMode) return null;

  if (variant === 'phone') {
    return (
      <View className="gap-2 pb-2">
        <CaptionText className="text-fg-4 text-center">
          Demo · kein echter SMS-Code nötig
        </CaptionText>
        <Button
          label="Demo: Code bestätigen (123456)"
          variant="dark"
          onPress={() => confirmDemoPhone(false)}
        />
        <Button
          label="Direkt zur App →"
          variant="ghost"
          onPress={() => skipToApp(gender)}
        />
      </View>
    );
  }

  if (variant === 'verify') {
    return (
      <View className="gap-2 mt-2">
        <Button
          label="Verifikation überspringen → App"
          variant="dark"
          onPress={() => skipVerificationSteps(true)}
        />
      </View>
    );
  }

  if (variant === 'pending') {
    return (
      <Button
        label="Demo: Sofort freischalten → App"
        onPress={() => skipToApproved(gender)}
        className="mt-2"
      />
    );
  }

  return (
    <View className="py-2 px-1 border border-dashed border-accent/40 rounded-md bg-accent/5 gap-2">
      <CaptionText className="text-accent text-center font-semibold">
        Demo-Modus · zum Testen
      </CaptionText>
      <Button label="Direkt zur App (alles überspringen)" onPress={() => skipToApp(gender)} />
    </View>
  );
}

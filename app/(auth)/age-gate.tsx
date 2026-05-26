import { useState } from 'react';
import { View, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText, StepLabel } from '@/components/ui/Typography';
import {
  isAtLeast18,
  parseBirthDate,
  formatBirthDateISO,
} from '@/lib/validation';
import { useAuthStore } from '@/stores/authStore';

export default function AgeGateScreen() {
  const setBirthDate = useAuthStore((s) => s.setBirthDate);
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const birthDate = parseBirthDate(day, month, year);
  const valid = birthDate !== null && isAtLeast18(birthDate);

  const onContinue = () => {
    if (!birthDate || !valid) return;
    setBirthDate(formatBirthDateISO(birthDate));
    advanceOnboarding('agb');
    router.push('/(auth)/agb');
  };

  const inputClass =
    'flex-1 bg-card border border-line rounded-md py-3.5 px-3 text-center text-white text-2xl font-display font-bold tracking-tight';

  return (
    <Screen className="px-6 pt-2 pb-6 gap-[18px]">
      <StepLabel>Vor dem Start</StepLabel>
      <DisplayText className="text-[30px] font-extrabold leading-tight tracking-tight">
        Wann bist{'\n'}du geboren?
      </DisplayText>
      <BodyText className="max-w-[260px]">
        Du musst mindestens 18 Jahre alt sein, um Fling zu nutzen.
      </BodyText>

      <View className="flex-row gap-2 mt-2">
        <TextInput
          value={day}
          onChangeText={(t) => setDay(t.replace(/\D/g, '').slice(0, 2))}
          placeholder="TT"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="number-pad"
          maxLength={2}
          className={inputClass}
        />
        <TextInput
          value={month}
          onChangeText={(t) => setMonth(t.replace(/\D/g, '').slice(0, 2))}
          placeholder="MM"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="number-pad"
          maxLength={2}
          className={inputClass}
        />
        <TextInput
          value={year}
          onChangeText={(t) => setYear(t.replace(/\D/g, '').slice(0, 4))}
          placeholder="JJJJ"
          placeholderTextColor="rgba(255,255,255,0.3)"
          keyboardType="number-pad"
          maxLength={4}
          className={inputClass}
        />
      </View>

      <View className="flex-row gap-2 -mt-3">
        {['Tag', 'Monat', 'Jahr'].map((label) => (
          <View key={label} className="flex-1 items-center">
            <StepLabel>{label}</StepLabel>
          </View>
        ))}
      </View>

      <View className="mt-auto p-3.5 bg-accent/10 border border-accent/20 rounded-md">
        <BodyText className="text-fg-2 text-xs leading-5">
          <BodyText className="text-accent font-bold">Hinweis:</BodyText> Dein
          Geburtsdatum bleibt privat und wird nur zur Altersprüfung verwendet.
        </BodyText>
      </View>

      <Button label="Weiter" disabled={!valid} onPress={onContinue} />
    </Screen>
  );
}

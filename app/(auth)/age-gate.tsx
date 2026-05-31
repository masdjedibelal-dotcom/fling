import { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { router } from 'expo-router';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { BodyText } from '@/components/ui/Typography';
import {
  isAtLeast18,
  parseBirthDate,
  formatBirthDateISO,
} from '@/lib/validation';
import { useAuthStore } from '@/stores/authStore';
import { accentRgba, FLING_RADIUS, FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

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

  const inputStyle = {
    flex: 1,
    backgroundColor: FLING_COLORS.card,
    borderWidth: 1,
    borderColor: FLING_COLORS.line2,
    borderRadius: FLING_RADIUS.md,
    paddingVertical: 16,
    textAlign: 'center' as const,
    color: '#fff',
    fontSize: FLING_TYPE.displayInput,
    fontFamily: 'Unbounded_700Bold',
  };

  return (
    <AuthLayout
      step="Vor dem Start"
      title={'Wann bist\ndu geboren?'}
      subtitle="Du musst mindestens 18 sein — dein Geburtsdatum bleibt privat."
      footer={<Button label="Weiter" disabled={!valid} onPress={onContinue} />}
    >
      <View className="flex-row gap-2.5">
        <TextInput
          value={day}
          onChangeText={(t) => setDay(t.replace(/\D/g, '').slice(0, 2))}
          placeholder="TT"
          placeholderTextColor={FLING_COLORS.fg4}
          keyboardType="number-pad"
          maxLength={2}
          style={inputStyle}
        />
        <TextInput
          value={month}
          onChangeText={(t) => setMonth(t.replace(/\D/g, '').slice(0, 2))}
          placeholder="MM"
          placeholderTextColor={FLING_COLORS.fg4}
          keyboardType="number-pad"
          maxLength={2}
          style={inputStyle}
        />
        <TextInput
          value={year}
          onChangeText={(t) => setYear(t.replace(/\D/g, '').slice(0, 4))}
          placeholder="JJJJ"
          placeholderTextColor={FLING_COLORS.fg4}
          keyboardType="number-pad"
          maxLength={4}
          style={inputStyle}
        />
      </View>
      <View className="flex-row gap-2.5 mt-2">
        {['Tag', 'Monat', 'Jahr'].map((label) => (
          <Text
            key={label}
            className="flex-1 text-center text-fg-4 font-semibold uppercase tracking-wide"
            style={{ fontSize: FLING_TYPE.caption }}
          >
            {label}
          </Text>
        ))}
      </View>
      <View
        className="mt-8 p-4 border border-accent/25"
        style={{
          borderRadius: FLING_RADIUS.md,
          backgroundColor: accentRgba(0.08),
        }}
      >
        <BodyText className="text-fg-2 leading-6">
          <Text className="text-accent font-bold">Diskret: </Text>
          Wir nutzen dein Alter nur zur Freischaltung — nichts wird öffentlich
          angezeigt.
        </BodyText>
      </View>
    </AuthLayout>
  );
}

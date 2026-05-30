import { useState } from 'react';
import { View, Pressable, Text, Linking, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { HeroText, BodyText, BodyLarge, StepLabel } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { DiscretionMark } from '@/components/graphics';
import { FLING_RADIUS, FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

import { LEGAL_URLS } from '@/lib/legalUrls';

function CheckboxRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className={`flex-row gap-3.5 p-4 border ${
        checked ? 'border-accent bg-accent/5' : 'border-line'
      }`}
      style={{ borderRadius: FLING_RADIUS.md, backgroundColor: FLING_COLORS.card }}
    >
      <View
        className={`w-6 h-6 rounded-md border items-center justify-center mt-0.5 ${
          checked ? 'bg-accent border-accent' : 'border-line-2'
        }`}
      >
        {checked ? <FlingIcon name="check" size={14} color="#fff" /> : null}
      </View>
      <View className="flex-1">{children}</View>
    </Pressable>
  );
}

export default function AgbScreen() {
  const setAgreements = useAuthStore((s) => s.setAgreements);
  const advanceOnboarding = useAuthStore((s) => s.advanceOnboarding);

  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const canContinue = terms && privacy;

  return (
    <Screen className="flex-1">
      <ScrollView className="flex-1 px-5 pt-2" contentContainerClassName="pb-6">
        <View className="flex-row items-center gap-2.5 mb-4">
          <BackButton />
          <StepLabel>Bedingungen</StepLabel>
        </View>

        <HeroText className="mb-3">Bevor du{'\n'}loslegst</HeroText>
        <BodyLarge className="mb-5">
          Diskret, EU-Daten, Chats weg nach 24 Stunden — kurz zustimmen, dann geht&apos;s
          los.
        </BodyLarge>

        <View
          className="flex-row items-center gap-3.5 border border-line p-4 mb-5"
          style={{ borderRadius: FLING_RADIUS.md, backgroundColor: FLING_COLORS.card }}
        >
          <DiscretionMark size={52} />
          <BodyText className="text-fg-2 flex-1 leading-6">
            Keine Screenshots in Chats. Einmal-Fotos. Verifizierte Profile.
          </BodyText>
        </View>

        <View className="gap-3">
          <CheckboxRow checked={terms} onToggle={() => setTerms((v) => !v)}>
            <Text
              style={{
                fontSize: FLING_TYPE.callout,
                lineHeight: 24,
                color: '#fff',
              }}
            >
              Ich akzeptiere die{' '}
              <Text
                className="text-accent font-semibold"
                onPress={() => Linking.openURL(LEGAL_URLS.terms)}
              >
                AGB
              </Text>
              .
            </Text>
          </CheckboxRow>

          <CheckboxRow checked={privacy} onToggle={() => setPrivacy((v) => !v)}>
            <Text
              style={{
                fontSize: FLING_TYPE.callout,
                lineHeight: 24,
                color: '#fff',
              }}
            >
              Ich akzeptiere die{' '}
              <Text
                className="text-accent font-semibold"
                onPress={() => Linking.openURL(LEGAL_URLS.privacy)}
              >
                Datenschutzerklärung
              </Text>
              .
            </Text>
          </CheckboxRow>

          <CheckboxRow checked={marketing} onToggle={() => setMarketing((v) => !v)}>
            <Text
              style={{
                fontSize: FLING_TYPE.callout,
                lineHeight: 24,
                color: FLING_COLORS.fg2,
              }}
            >
              Tipps & Neuigkeiten per E-Mail (optional)
            </Text>
          </CheckboxRow>
        </View>
      </ScrollView>

      <View className="px-5 pb-6 pt-2">
        <Button
          label="Akzeptieren & weiter"
          disabled={!canContinue}
          onPress={() => {
            setAgreements(terms, privacy, marketing);
            advanceOnboarding('welcome');
            router.push('/(auth)/welcome');
          }}
        />
      </View>
    </Screen>
  );
}

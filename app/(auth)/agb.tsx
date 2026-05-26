import { useState } from 'react';
import { View, Pressable, Text, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { DisplayText, BodyText, StepLabel } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { DiscretionMark } from '@/components/graphics';

const TERMS_URL = 'https://fling.app/agb';
const PRIVACY_URL = 'https://fling.app/datenschutz';

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
      className={`flex-row gap-3 p-3.5 rounded-md border ${
        checked ? 'border-accent bg-accent/5' : 'border-line bg-card'
      }`}
    >
      <View
        className={`w-[22px] h-[22px] rounded-md border items-center justify-center mt-0.5 ${
          checked ? 'bg-accent border-accent' : 'border-line-2'
        }`}
      >
        {checked ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
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

  const onContinue = () => {
    setAgreements(terms, privacy, marketing);
    advanceOnboarding('welcome');
    router.push('/(auth)/welcome');
  };

  return (
    <Screen className="px-5 pt-2 pb-6 gap-3.5">
      <View className="flex-row items-center gap-2.5">
        <BackButton />
        <StepLabel>Bedingungen</StepLabel>
      </View>

      <View className="mt-1 gap-2">
        <DisplayText className="text-[30px] font-extrabold leading-tight">
          Bevor du{'\n'}loslegst
        </DisplayText>
        <BodyText>
          Wir brauchen deine Zustimmung zu unseren Bedingungen und unserem
          Umgang mit Daten.
        </BodyText>
      </View>

      <View className="flex-row items-center gap-3 rounded-xl border border-line bg-card/40 p-3.5">
        <DiscretionMark size={48} />
        <BodyText className="text-fg-3 text-[12px] leading-5 flex-1">
          Deine Daten bleiben in der EU. Chats löschen sich nach 24 Stunden — keine Spuren.
        </BodyText>
      </View>

      <CheckboxRow checked={terms} onToggle={() => setTerms((v) => !v)}>
        <Text className="text-fg text-[13px] leading-5 font-medium">
          Ich akzeptiere die{' '}
          <Text
            className="text-accent underline font-semibold"
            onPress={() => Linking.openURL(TERMS_URL)}
          >
            Allgemeinen Geschäftsbedingungen
          </Text>
          .
          <Text className="text-fg-3 text-[11px] block mt-0.5">
            Verhaltensregeln, Konto-Kündigung, Haftung.
          </Text>
        </Text>
      </CheckboxRow>

      <CheckboxRow checked={privacy} onToggle={() => setPrivacy((v) => !v)}>
        <Text className="text-fg text-[13px] leading-5 font-medium">
          Ich akzeptiere die{' '}
          <Text
            className="text-accent underline font-semibold"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          >
            Datenschutzerklärung
          </Text>
          .
          <Text className="text-fg-3 text-[11px] block mt-0.5">
            DSGVO-konform · Daten in der EU gespeichert.
          </Text>
        </Text>
      </CheckboxRow>

      <CheckboxRow checked={marketing} onToggle={() => setMarketing((v) => !v)}>
        <Text className="text-fg text-[13px] leading-5 font-medium">
          Ich möchte Tipps und Neuigkeiten per E-Mail (optional).
        </Text>
      </CheckboxRow>

      <View className="mt-auto">
        <Button
          label="Akzeptieren & weiter"
          disabled={!canContinue}
          onPress={onContinue}
        />
      </View>
    </Screen>
  );
}

import { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { VerificationProgress } from '@/components/auth/VerificationProgress';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuthStore } from '@/stores/authStore';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  upsertUserProfile,
  fetchUserProfile,
} from '@/lib/auth';
import { normalizeGermanPhone, maskPhone } from '@/lib/validation';
import { getPostAuthRoute } from '@/stores/authStore';
import { isDemoMode } from '@/lib/demoMode';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';
import type { Gender } from '@/lib/types';

type Phase = 'phone' | 'otp' | 'welcome_back';

export default function PhoneVerifyScreen() {
  const gender = useAuthStore((s) => s.gender) as Gender;
  const birthDate = useAuthStore((s) => s.birthDate)!;
  const termsAccepted = useAuthStore((s) => s.termsAccepted);
  const privacyAccepted = useAuthStore((s) => s.privacyAccepted);
  const marketingOptIn = useAuthStore((s) => s.marketingOptIn);
  const isReturningUser = useAuthStore((s) => s.isReturningUser);
  const setPhone = useAuthStore((s) => s.setPhone);
  const setReturningUser = useAuthStore((s) => s.setReturningUser);
  const setSession = useAuthStore((s) => s.setSession);

  const totalSteps = gender === 'male' ? 3 : 2;
  const [phase, setPhase] = useState<Phase>(isReturningUser ? 'welcome_back' : 'phone');
  const [localPhone, setLocalPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(24);
  const phoneE164 = localPhone ? normalizeGermanPhone(localPhone) : useAuthStore.getState().phone ?? '';

  useEffect(() => {
    if (phase !== 'otp' || resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase, resendSeconds]);

  useEffect(() => {
    if (otp.length === 6) {
      void confirmOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const sendOtp = async () => {
    if (isDemoMode && !localPhone) {
      setLocalPhone('15123456789');
    }
    const phone = localPhone ? normalizeGermanPhone(localPhone) : '+4915123456789';
    if (!isDemoMode && (!phone || phone.length < 8)) {
      Alert.alert('Nummer prüfen', 'Bitte gib eine gültige Handynummer ein.');
      return;
    }
    setLoading(true);
    const { error } = await sendPhoneOtp(phone);
    setLoading(false);
    if (error) {
      Alert.alert('Fehler', error.message);
      return;
    }
    setPhone(phone);
    setPhase('otp');
    setResendSeconds(0);
    if (isDemoMode) setOtp('123456');
  };

  const confirmOtp = async () => {
    setLoading(true);
    const phone =
      localPhone ? normalizeGermanPhone(localPhone) : useAuthStore.getState().phone ?? '+4915123456789';
    const { data, error, demo } = await verifyPhoneOtp(phone, otp || '123456');
    setLoading(false);
    if (error) {
      Alert.alert('Code ungültig', error.message);
      setOtp('');
      return;
    }

    const userId = data?.user?.id ?? 'demo-user-id';
    let profile = null;

    if (!demo) {
      const existing = await fetchUserProfile(userId);
      profile = existing.data;
    }

    if (profile) {
      setSession(userId, profile);
      router.replace(getPostAuthRoute(useAuthStore.getState()) as never);
      return;
    }

    await upsertUserProfile({
      id: userId,
      gender,
      birthDate,
      termsAccepted,
      privacyAccepted,
      marketingOptIn,
    });

    const created = await fetchUserProfile(userId);
    setSession(userId, created.data);
    router.replace(getPostAuthRoute(useAuthStore.getState()) as never);
  };

  if (phase === 'welcome_back') {
    return (
      <Screen className="px-5">
        <MetaText className="mt-6">
          <Text className="text-white font-bold">Telefon</Text> · bereits registriert
        </MetaText>
        <View className="flex-1 items-center justify-center gap-4 px-2">
          <View className="w-[72px] h-[72px] rounded-full bg-green/10 border border-green/30 items-center justify-center">
            <Text className="text-green text-3xl">✓</Text>
          </View>
          <DisplayText className="text-[32px] text-center leading-tight">
            Willkommen{'\n'}zurück
          </DisplayText>
          <BodyText className="text-center">
            Diese Nummer ist bereits bei Fling registriert. Melde dich an, um
            deinen Account zu nutzen.
          </BodyText>
          <View className="w-full p-4 bg-card border border-line rounded-md">
            <MetaText className="text-fg-3 normal-case tracking-normal text-sm">
              {maskPhone(phoneE164 || '+490000000000')}
            </MetaText>
            <BodyText className="text-fg-4 text-[11px] mt-1">
              Wir senden dir einen Login-Code per SMS.
            </BodyText>
          </View>
        </View>
        <View className="gap-2 pb-6">
          <Button label="Code anfordern" onPress={() => setPhase('otp')} />
          <Button
            label="Andere Nummer verwenden"
            variant="ghost"
            onPress={() => {
              setReturningUser(false);
              setPhase('phone');
            }}
          />
        </View>
      </Screen>
    );
  }

  if (phase === 'phone') {
    return (
      <Screen className="px-5 pt-2">
        <View className="pt-4 gap-5">
          <VerificationProgress total={totalSteps} current={1} label="Telefon" />
          <DisplayText className="text-[32px] font-extrabold leading-tight">
            Bestätige{'\n'}deine Nummer
          </DisplayText>
          <BodyText className="max-w-[260px]">
            Wir schicken dir einen 6-stelligen Code. Keine Werbung, keine
            Weitergabe.
          </BodyText>
        </View>

        <View className="flex-1 justify-center px-1">
          <View className="flex-row items-center bg-card border border-line rounded-md px-4 py-3.5">
            <Text className="text-white font-mono text-base mr-2">+49</Text>
            <TextInput
              value={localPhone}
              onChangeText={setLocalPhone}
              placeholder="151 23456789"
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="phone-pad"
              className="flex-1 text-white text-base font-body"
            />
          </View>
        </View>

        <View className="pb-6 gap-2">
          <Button label="Code senden" loading={loading} onPress={sendOtp} />
          {isDemoMode ? <DemoShortcuts variant="phone" gender={gender} /> : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen className="px-5 pt-2">
      <View className="pt-4 gap-5">
        <VerificationProgress total={totalSteps} current={1} label="Telefon" />
        <DisplayText className="text-[32px] font-extrabold leading-tight">
          Bestätige{'\n'}deine Nummer
        </DisplayText>
        <BodyText className="max-w-[260px]">
          Wir schicken dir einen 6-stelligen Code. Keine Werbung, keine
          Weitergabe.
        </BodyText>
      </View>

      <View className="flex-1 justify-center gap-5">
        <OtpInput value={otp} onChange={setOtp} />
        <Pressable
          disabled={resendSeconds > 0}
          onPress={sendOtp}
          className="items-center"
        >
          <MetaText className="text-[11px] tracking-wide">
            Erneut senden in{' '}
            <Text className="text-accent">
              {resendSeconds > 0
                ? `00:${String(resendSeconds).padStart(2, '0')}`
                : 'jetzt'}
            </Text>
          </MetaText>
        </Pressable>
      </View>

      <View className="pb-6 gap-2">
        <Button
          label="Bestätigen"
          loading={loading}
          disabled={!isDemoMode && otp.length < 6}
          onPress={confirmOtp}
        />
        {isDemoMode ? <DemoShortcuts variant="phone" gender={gender} /> : null}
      </View>
    </Screen>
  );
}

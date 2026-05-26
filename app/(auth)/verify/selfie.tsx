import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { VerificationProgress } from '@/components/auth/VerificationProgress';
import { PermissionSheet } from '@/components/auth/PermissionSheet';
import {
  uploadVerificationDoc,
  updateVerificationStatus,
  enqueueVerification,
} from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { isDemoMode } from '@/lib/demoMode';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';

export default function SelfieScreen() {
  const gender = useAuthStore((s) => s.gender);
  const userId = useAuthStore((s) => s.userId) ?? 'demo-user-id';
  const setVerificationStatus = useAuthStore((s) => s.setVerificationStatus);
  const totalSteps = gender === 'male' ? 3 : 2;
  const currentStep = gender === 'male' ? 3 : 2;

  const [showPermission, setShowPermission] = useState(!isDemoMode);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const startCapture = async () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          clearInterval(timer);
          return null;
        }
        return c - 1;
      });
    }, 1000);

    setTimeout(async () => {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 5,
        quality: 0.8,
      });
      setLoading(false);

      if (result.canceled || !result.assets[0]) return;

      const { error: uploadError } = await uploadVerificationDoc(
        userId,
        'selfie',
        result.assets[0].uri,
      );
      if (uploadError) {
        Alert.alert('Upload fehlgeschlagen', uploadError.message);
        return;
      }

      await enqueueVerification(userId);
      await updateVerificationStatus(userId, 'pending_review');
      setVerificationStatus('pending_review');
      router.replace('/(auth)/verify/pending');
    }, 3200);
  };

  return (
    <Screen className="px-5 pt-2 pb-6">
      <View className="pt-4 gap-5">
        <VerificationProgress
          total={totalSteps}
          current={currentStep}
          label="Selfie"
        />
        <DisplayText className="text-[32px] font-extrabold leading-tight">
          Kurzes{'\n'}Selfie-Video
        </DisplayText>
        <BodyText className="max-w-[260px]">
          Wir prüfen mit einer kurzen Aufnahme, dass du es wirklich bist.
        </BodyText>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="w-[200px] h-[240px] rounded-full border border-white/15 items-center justify-center overflow-hidden">
          <View className="w-[88px] h-[108px] mt-3 rounded-full bg-white/5" />
          {countdown !== null ? (
            <Text className="absolute text-[90px] font-display font-extrabold text-white/90">
              {countdown}
            </Text>
          ) : null}
        </View>
        <BodyText className="text-fg-2 text-center mt-5 max-w-[240px]">
          Kopf langsam nach rechts drehen
        </BodyText>
      </View>

      <Button
        label="Aufnahme starten"
        loading={loading}
        onPress={startCapture}
      />
      <DemoShortcuts variant="verify" />

      <PermissionSheet
        visible={showPermission}
        icon="camera-outline"
        title="Kamera-Zugriff"
        description="Nötig für Ausweis-Scan und Live-Selfie. Du hast volle Kontrolle über jede Aufnahme."
        primaryLabel="Erlauben"
        secondaryLabel="Abbrechen"
        onPrimary={() => setShowPermission(false)}
        onSecondary={() => router.back()}
      />
    </Screen>
  );
}

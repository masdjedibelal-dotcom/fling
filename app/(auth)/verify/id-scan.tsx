import { useState } from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { VerificationProgress } from '@/components/auth/VerificationProgress';
import { PermissionSheet } from '@/components/auth/PermissionSheet';
import {
  uploadVerificationDoc,
  updateVerificationStatus,
} from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { isDemoMode } from '@/lib/demoMode';
import { DemoShortcuts } from '@/components/auth/DemoShortcuts';

export default function IdScanScreen() {
  const userId = useAuthStore((s) => s.userId) ?? 'demo-user-id';
  const setVerificationStatus = useAuthStore((s) => s.setVerificationStatus);
  const [showPermission, setShowPermission] = useState(!isDemoMode);
  const [loading, setLoading] = useState(false);

  const captureId = async () => {
    setLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    setLoading(false);

    if (result.canceled || !result.assets[0]) return;

    const { error: uploadError } = await uploadVerificationDoc(
      userId,
      'id_front',
      result.assets[0].uri,
    );
    if (uploadError) {
      Alert.alert('Upload fehlgeschlagen', uploadError.message);
      return;
    }

    await updateVerificationStatus(userId, 'documents_pending');
    setVerificationStatus('documents_pending');
    router.push('/(auth)/verify/selfie');
  };

  return (
    <Screen className="px-5 pt-2 pb-6">
      <View className="pt-4 gap-5">
        <VerificationProgress total={3} current={2} label="Identität" />
        <DisplayText className="text-[32px] font-extrabold leading-tight">
          Ausweis{'\n'}fotografieren
        </DisplayText>
        <BodyText className="max-w-[260px]">
          Leg den Personalausweis flach auf eine dunkle Fläche. Vorderseite zuerst.
        </BodyText>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="w-[240px] aspect-[1.586] rounded-md border border-line bg-card-2 overflow-hidden items-center justify-center">
          <View className="absolute inset-5 rounded-sm border border-white/10 bg-surface flex-row items-end gap-3 p-3.5 -rotate-[1.5deg]">
            <View className="w-8 h-10 rounded bg-white/5 border border-white/10" />
            <View className="flex-1 gap-1.5">
              <View className="h-1 bg-white/10 rounded w-[55%]" />
              <View className="h-1 bg-white/10 rounded w-[78%]" />
              <View className="h-1 bg-white/10 rounded w-[42%]" />
            </View>
          </View>
          <View className="absolute bottom-3.5 px-3 py-1.5 rounded-pill bg-black/55 border border-white/10">
            <BodyText className="text-white text-[10.5px] text-center">
              Halte den Ausweis ruhig
            </BodyText>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mt-5 px-3 py-1.5 rounded-pill bg-white/5 border border-line">
          <Ionicons name="lock-closed-outline" size={12} color="rgba(255,255,255,0.5)" />
          <BodyText className="text-[11px]">Daten werden nicht gespeichert</BodyText>
        </View>
      </View>

      <Button
        label="Vorderseite fotografieren"
        loading={loading}
        onPress={captureId}
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

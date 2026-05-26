import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { signOut } from '@/lib/auth';
import { deleteOwnAccount } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';

export default function AccountSettingsScreen() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const signOutLocal = useAuthStore((s) => s.signOutLocal);
  const resetOnboarding = useAuthStore((s) => s.resetOnboarding);

  const onDelete = async () => {
    await deleteOwnAccount();
    await signOut();
    signOutLocal();
    resetOnboarding();
    setDeleteOpen(false);
    router.replace('/(auth)/age-gate');
  };

  return (
    <Screen className="px-4 pt-2">
      <View className="flex-row items-center gap-3 mb-6">
        <BackButton />
        <DisplayText className="text-xl">Konto</DisplayText>
      </View>

      <BodyText className="text-fg-3 mb-8">
        Hier kannst du dein Konto dauerhaft löschen. Alle Profildaten werden
        unwiderruflich entfernt.
      </BodyText>

      <Button
        label="Konto löschen"
        variant="ghost"
        onPress={() => setDeleteOpen(true)}
      />

      <ConfirmModal
        visible={deleteOpen}
        title="Konto löschen?"
        message="Bist du sicher? Dein Profil, Fotos und alle Daten werden unwiderruflich gelöscht."
        confirmLabel="Ja, löschen"
        cancelLabel="Abbrechen"
        onConfirm={onDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Screen>
  );
}

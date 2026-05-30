import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { ScreenTitle, BodyLarge } from '@/components/ui/Typography';
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
    <Screen className="px-5 pt-3">
      <View className="flex-row items-center gap-3 mb-6">
        <BackButton />
        <ScreenTitle>Konto</ScreenTitle>
      </View>

      <BodyLarge className="leading-7 mb-10">
        Dein Konto und alle Daten werden unwiderruflich gelöscht — Chats, Fotos,
        Profil.
      </BodyLarge>

      <Button label="Konto löschen" variant="ghost" onPress={() => setDeleteOpen(true)} />

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

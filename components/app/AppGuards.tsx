import { useEffect, useState } from 'react';
import { Modal, View, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { fetchAppConfig } from '@/lib/api';
import type { AppConfig } from '@/lib/types';
import { ScreenTitle, BodyLarge } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { Screen } from '@/components/ui/Screen';

export function AppGuards({ children }: { children: React.ReactNode }) {
  const accountStatus = useAuthStore((s) => s.accountStatus);
  const profile = useAuthStore((s) => s.profile);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    fetchAppConfig().then(setConfig);
  }, []);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const needsUpdate =
    config && appVersion < config.min_version.replace(/"/g, '');

  if (accountStatus === 'suspended' || accountStatus === 'banned') {
    return (
      <Screen className="items-center justify-center px-6">
        <ScreenTitle className="text-center mb-4">Account gesperrt</ScreenTitle>
        <BodyLarge className="text-center leading-7 text-fg-2">
          Dein Account wurde vorübergehend gesperrt.
          {profile?.suspended_until
            ? ` Bis ${new Date(profile.suspended_until).toLocaleDateString('de-DE')}.`
            : ''}
        </BodyLarge>
      </Screen>
    );
  }

  if (config?.maintenance_mode) {
    return (
      <Screen className="items-center justify-center px-6">
        <ScreenTitle className="text-center mb-4">Wartungsmodus</ScreenTitle>
        <BodyLarge className="text-center leading-7 text-fg-2">
          Fling wird gerade aktualisiert. Bitte versuche es in Kürze erneut.
        </BodyLarge>
      </Screen>
    );
  }

  return (
    <>
      {children}
      <Modal visible={!!needsUpdate} transparent={false}>
        <Screen className="items-center justify-center px-6">
          <ScreenTitle className="text-center mb-4">Update erforderlich</ScreenTitle>
          <BodyLarge className="text-center mb-8 leading-7 text-fg-2">
            Bitte aktualisiere Fling, um die App weiter zu nutzen.
          </BodyLarge>
          <Button
            label="Im App Store öffnen"
            onPress={() => {
              const url =
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com'
                  : 'https://play.google.com';
              Linking.openURL(url);
            }}
          />
        </Screen>
      </Modal>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Modal, View, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { fetchAppConfig } from '@/lib/api';
import type { AppConfig } from '@/lib/types';
import { DisplayText, BodyText } from '@/components/ui/Typography';
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
        <DisplayText className="text-2xl text-center mb-3">
          Account gesperrt
        </DisplayText>
        <BodyText className="text-center">
          Dein Account wurde vorübergehend gesperrt.
          {profile?.suspended_until
            ? ` Bis ${new Date(profile.suspended_until).toLocaleDateString('de-DE')}.`
            : ''}
        </BodyText>
      </Screen>
    );
  }

  if (config?.maintenance_mode) {
    return (
      <Screen className="items-center justify-center px-6">
        <DisplayText className="text-2xl text-center mb-3">
          Wartungsmodus
        </DisplayText>
        <BodyText className="text-center">
          Fling wird gerade aktualisiert. Bitte versuche es in Kürze erneut.
        </BodyText>
      </Screen>
    );
  }

  return (
    <>
      {children}
      <Modal visible={!!needsUpdate} transparent={false}>
        <Screen className="items-center justify-center px-6">
          <DisplayText className="text-2xl text-center mb-3">
            Update erforderlich
          </DisplayText>
          <BodyText className="text-center mb-6">
            Bitte aktualisiere Fling, um die App weiter zu nutzen.
          </BodyText>
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

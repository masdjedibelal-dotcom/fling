import { View, Switch } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { useAppStore } from '@/stores/appStore';

const TOGGLES: { key: keyof ReturnType<typeof useAppStore.getState>['notificationPrefs']; label: string; defaultOn: boolean }[] = [
  { key: 'new_pick', label: 'Neue Auswahl / Match', defaultOn: true },
  { key: 'new_message', label: 'Neue Nachricht', defaultOn: true },
  { key: 'warning_6h', label: '6h Warnung', defaultOn: true },
  { key: 'pick_expired', label: '24 Stunden vorbei', defaultOn: true },
  { key: 'marketing', label: 'Marketing', defaultOn: false },
];

export default function NotificationsSettingsScreen() {
  const prefs = useAppStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useAppStore((s) => s.setNotificationPrefs);

  return (
    <Screen className="px-4 pt-2">
      <View className="flex-row items-center gap-3 mb-6">
        <BackButton />
        <DisplayText className="text-xl">Benachrichtigungen</DisplayText>
      </View>

      <View className="bg-card border border-line rounded-md overflow-hidden">
        {TOGGLES.map((t, i) => (
          <View
            key={t.key}
            className={`flex-row justify-between items-center px-4 py-4 ${
              i < TOGGLES.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <BodyText className="text-white font-semibold">{t.label}</BodyText>
            <Switch
              value={prefs[t.key]}
              onValueChange={(v) => setNotificationPrefs({ [t.key]: v })}
              trackColor={{ true: '#D11537', false: '#333' }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

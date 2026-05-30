import { View, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { ScreenTitle } from '@/components/ui/Typography';
import { FlingSwitch } from '@/components/ui/FlingSwitch';
import { useAppStore } from '@/stores/appStore';
import { FLING_COLORS, FLING_RADIUS, FLING_TYPE } from '@/lib/designTokens';

const TOGGLES: {
  key: keyof ReturnType<typeof useAppStore.getState>['notificationPrefs'];
  label: string;
}[] = [
  { key: 'new_pick', label: 'Neuer Pick' },
  { key: 'new_message', label: 'Neue Nachricht' },
  { key: 'warning_6h', label: 'Noch 6 Stunden' },
  { key: 'pick_expired', label: 'Pick abgelaufen' },
  { key: 'marketing', label: 'News & Tipps' },
];

export default function NotificationsSettingsScreen() {
  const prefs = useAppStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useAppStore((s) => s.setNotificationPrefs);

  return (
    <Screen className="px-5 pt-3">
      <View className="flex-row items-center gap-3 mb-6">
        <BackButton />
        <View style={{ flex: 1, minWidth: 0 }}>
          <ScreenTitle numberOfLines={1} ellipsizeMode="tail">
            Benachrichtigungen
          </ScreenTitle>
        </View>
      </View>

      <View
        className="border border-line overflow-hidden"
        style={{ borderRadius: FLING_RADIUS.md, backgroundColor: FLING_COLORS.card }}
      >
        {TOGGLES.map((t, i) => (
          <View
            key={t.key}
            className={`flex-row justify-between items-center px-4 py-4 gap-3 ${
              i < TOGGLES.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <Text
              className="text-white font-semibold flex-1 shrink"
              style={{ fontSize: FLING_TYPE.callout }}
            >
              {t.label}
            </Text>
            <FlingSwitch
              value={prefs[t.key]}
              onValueChange={(v) => setNotificationPrefs({ [t.key]: v })}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

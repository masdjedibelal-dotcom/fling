import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import type { LocationMode } from '@/lib/types';
import { MAX_CITY_LENGTH } from '@/lib/constants';

export function ProfileLocationBar({
  mode,
  city,
  detecting,
  onSelectFixed,
  onSelectAuto,
  onCityChange,
  embedded,
}: {
  mode: LocationMode;
  city: string;
  detecting: boolean;
  onSelectFixed: () => void;
  onSelectAuto: () => void;
  onCityChange: (city: string) => void;
  /** Im Bearbeiten-Modal — ohne extra Außenabstand */
  embedded?: boolean;
}) {
  const openSettings = () => {
    if (Platform.OS === 'ios') Linking.openURL('app-settings:');
    else Linking.openSettings();
  };

  return (
    <View className={embedded ? 'mb-4' : 'mb-4 px-1'}>
      <View className="flex-row gap-2 mb-3">
        {(['fixed', 'auto'] as LocationMode[]).map((m) => {
          const active = mode === m;
          const onPress = m === 'fixed' ? onSelectFixed : onSelectAuto;
          return (
            <Pressable
              key={m}
              onPress={onPress}
              disabled={detecting && m === 'auto'}
              className={`flex-1 py-2.5 rounded-pill border items-center ${
                active ? 'bg-white/10 border-white/25' : 'border-line bg-white/5'
              }`}
            >
              {detecting && m === 'auto' ? (
                <ActivityIndicator size="small" color="#D11537" />
              ) : (
                <Text
                  className={`text-[12px] font-semibold ${
                    active ? 'text-white' : 'text-fg-3'
                  }`}
                >
                  {m === 'fixed' ? 'Fest' : 'Standort'}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>

      {mode === 'fixed' ? (
        <TextInput
          value={city}
          onChangeText={(t) => onCityChange(t.slice(0, MAX_CITY_LENGTH))}
          className="bg-white/5 border border-line-2 rounded-md px-4 py-3 text-white text-[15px] mb-2"
          placeholderTextColor="rgba(255,255,255,0.35)"
          placeholder="z.B. München"
        />
      ) : (
        <Pressable onPress={openSettings}>
          <Text className="text-fg-4 text-[11px] text-center">
            Standort über Geräteeinstellungen ·{' '}
            <Text className="text-accent">Einstellungen öffnen</Text>
          </Text>
        </Pressable>
      )}
    </View>
  );
}

import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import type { LocationMode } from '@/lib/types';
import { MAX_CITY_LENGTH, MAX_JOB_LENGTH } from '@/lib/constants';
import { FLING_COLORS, FLING_INPUT_TEXT, FLING_TYPE } from '@/lib/designTokens';

function InfoCard({
  label,
  value,
  isLast,
  onPress,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  onPress?: () => void;
}) {
  const inner = (
    <View
      className={`flex-1 items-center py-3 px-1 ${isLast ? '' : 'border-r border-line'}`}
    >
      <Text
        className="text-white font-bold tracking-tight text-center"
        style={{ fontSize: FLING_TYPE.body }}
        numberOfLines={1}
      >
        {value || '—'}
      </Text>
      <Text
        className="text-fg-3 font-semibold mt-1.5"
        style={{ fontSize: FLING_TYPE.caption }}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="flex-1">
        {inner}
      </Pressable>
    );
  }
  return <View className="flex-1">{inner}</View>;
}

export function ProfileInfoSection({
  job,
  age,
  city,
  locationMode,
  showJob = true,
  editingField,
  onEditField,
  onJobChange,
  onAgeChange,
  onCityChange,
  onLocationModeChange,
  onDetectLocation,
  detectingLocation,
}: {
  job: string;
  age: string;
  city: string;
  locationMode: LocationMode;
  showJob?: boolean;
  editingField: 'job' | 'age' | 'city' | null;
  onEditField: (field: 'job' | 'age' | 'city' | null) => void;
  onJobChange: (v: string) => void;
  onAgeChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onLocationModeChange: (mode: LocationMode) => void;
  onDetectLocation: () => void;
  detectingLocation: boolean;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row rounded-lg overflow-hidden bg-card/80 border border-white/10">
        {showJob ? (
          <InfoCard
            label="Beruf"
            value={job}
            onPress={() => onEditField(editingField === 'job' ? null : 'job')}
          />
        ) : null}
        <InfoCard
          label="Alter"
          value={age}
          onPress={() => onEditField(editingField === 'age' ? null : 'age')}
        />
        <InfoCard
          label="Ort"
          value={city}
          isLast
          onPress={() => onEditField(editingField === 'city' ? null : 'city')}
        />
      </View>

      {showJob && editingField === 'job' ? (
        <TextInput
          value={job}
          onChangeText={(t) => onJobChange(t.slice(0, MAX_JOB_LENGTH))}
          onBlur={() => onEditField(null)}
          autoFocus
          className="mt-2 bg-white/5 border border-line-2 rounded-md px-4 py-3 text-white font-body"
          style={FLING_INPUT_TEXT}
          placeholderTextColor="rgba(255,255,255,0.35)"
          placeholder="z.B. Architekt"
        />
      ) : null}
      {editingField === 'age' ? (
        <TextInput
          value={age}
          onChangeText={(t) => onAgeChange(t.replace(/\D/g, '').slice(0, 2))}
          onBlur={() => onEditField(null)}
          autoFocus
          keyboardType="number-pad"
          className="mt-2 bg-white/5 border border-line-2 rounded-md px-4 py-3 text-white font-body"
          style={FLING_INPUT_TEXT}
          placeholderTextColor="rgba(255,255,255,0.35)"
          placeholder="Alter"
        />
      ) : null}
      {editingField === 'city' ? (
        <TextInput
          value={city}
          onChangeText={(t) => onCityChange(t.slice(0, MAX_CITY_LENGTH))}
          onBlur={() => onEditField(null)}
          autoFocus
          editable={locationMode === 'fixed'}
          className="mt-2 bg-white/5 border border-line-2 rounded-md px-4 py-3 text-white font-body"
          style={FLING_INPUT_TEXT}
          placeholderTextColor="rgba(255,255,255,0.35)"
          placeholder="z.B. München"
        />
      ) : null}

      <View className="flex-row mt-3 gap-2">
        {(['fixed', 'auto'] as LocationMode[]).map((mode) => {
          const active = locationMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => {
                onLocationModeChange(mode);
                if (mode === 'auto') onDetectLocation();
              }}
              className={`flex-1 py-2.5 rounded-pill border items-center ${
                active ? 'bg-white/10 border-white/25' : 'border-line bg-white/5'
              }`}
            >
              <Text
                className={`font-semibold ${active ? 'text-white' : 'text-fg-3'}`}
                style={{ fontSize: FLING_TYPE.subhead }}
              >
                {mode === 'fixed' ? 'Fest' : 'Standort'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {locationMode === 'auto' ? (
        <Pressable
          onPress={onDetectLocation}
          disabled={detectingLocation}
          className="mt-2 py-2.5 rounded-md border border-line bg-white/5 flex-row items-center justify-center gap-2"
        >
          {detectingLocation ? (
            <ActivityIndicator size="small" color={FLING_COLORS.accent} />
          ) : (
            <Text
              className="text-fg-2 font-semibold"
              style={{ fontSize: FLING_TYPE.caption }}
            >
              Standort jetzt ermitteln
            </Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

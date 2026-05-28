import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ProfileInterestEditor } from '@/components/profile/ProfileInterestEditor';
import { ProfileBioField } from '@/components/profile/ProfileBioField';
import { ProfileLocationBar } from '@/components/profile/ProfileLocationBar';
import { MAX_JOB_LENGTH } from '@/lib/constants';
import type { Availability, Gender, LocationMode } from '@/lib/types';

const RADIUS_OPTIONS = [5, 10, 25] as const;

const AVAILABILITY_OPTIONS: { key: Availability; label: string }[] = [
  { key: 'now', label: 'Jetzt' },
  { key: 'today', label: 'Heute' },
  { key: 'off', label: 'Pause' },
];

export type ProfileEditDraft = {
  display_name: string;
  job: string;
  age: string;
  city: string;
  location_mode: LocationMode;
  latitude: number | null;
  longitude: number | null;
  search_radius_km: number;
  availability: Availability;
  interest_tags: string[];
  bio: string;
};

export function ProfileEditModal({
  visible,
  draft,
  saving,
  gender,
  detectingLocation,
  onChange,
  onCancel,
  onSave,
  onDetectAutoLocation,
}: {
  visible: boolean;
  draft: ProfileEditDraft;
  saving: boolean;
  gender: Gender;
  detectingLocation?: boolean;
  onChange: (patch: Partial<ProfileEditDraft>) => void;
  onCancel: () => void;
  onSave: () => void;
  onDetectAutoLocation: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable className="flex-1 bg-black/60" onPress={onCancel} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="absolute bottom-0 left-0 right-0 max-h-[88%]"
      >
        <View className="bg-card border-t border-line-2 rounded-t-3xl px-5 pt-5 pb-8">
          <Text className="text-white text-lg font-bold text-center mb-4">Profil bearbeiten</Text>

          <ScrollView
            className="max-h-[520px]"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FieldLabel>Name</FieldLabel>
            <TextInput
              value={draft.display_name}
              onChangeText={(t) => onChange({ display_name: t.slice(0, 32) })}
              className="bg-white/5 border border-line rounded-md px-4 py-3 text-white text-[15px] mb-4"
              placeholderTextColor="rgba(255,255,255,0.35)"
              placeholder="Dein Name"
            />

            <FieldLabel>Beruf</FieldLabel>
            <TextInput
              value={draft.job}
              onChangeText={(t) => onChange({ job: t.slice(0, MAX_JOB_LENGTH) })}
              className="bg-white/5 border border-line rounded-md px-4 py-3 text-white text-[15px] mb-4"
              placeholderTextColor="rgba(255,255,255,0.35)"
              placeholder="z.B. Architekt"
            />

            <FieldLabel>Alter</FieldLabel>
            <TextInput
              value={draft.age}
              onChangeText={(t) => onChange({ age: t.replace(/\D/g, '').slice(0, 2) })}
              keyboardType="number-pad"
              className="bg-white/5 border border-line rounded-md px-4 py-3 text-white text-[15px] mb-4"
              placeholderTextColor="rgba(255,255,255,0.35)"
              placeholder="Alter"
            />

            <FieldLabel>Standort</FieldLabel>
            <ProfileLocationBar
              mode={draft.location_mode}
              city={draft.city}
              detecting={detectingLocation ?? false}
              onSelectFixed={() => onChange({ location_mode: 'fixed' })}
              onSelectAuto={onDetectAutoLocation}
              onCityChange={(city) => onChange({ city })}
              embedded
            />

            <FieldLabel>
              {gender === 'male' ? 'Sichtbarkeits-Radius' : 'Radius'}
            </FieldLabel>
            <View className="flex-row gap-2 mb-4">
              {RADIUS_OPTIONS.map((km) => (
                <Pressable
                  key={km}
                  onPress={() => onChange({ search_radius_km: km })}
                  className={`flex-1 py-2.5 rounded-pill border items-center ${
                    draft.search_radius_km === km
                      ? 'bg-accent border-accent'
                      : 'border-line bg-white/5'
                  }`}
                >
                  <Text className="text-white text-xs font-semibold">{km} km</Text>
                </Pressable>
              ))}
            </View>

            <FieldLabel>Verfügbarkeit</FieldLabel>
            <View className="flex-row gap-2 mb-4">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => onChange({ availability: opt.key })}
                  className={`flex-1 py-2.5 rounded-pill border items-center ${
                    draft.availability === opt.key
                      ? 'bg-accent border-accent'
                      : 'border-line bg-white/5'
                  }`}
                >
                  <Text className="text-white text-xs font-semibold">{opt.label}</Text>
                </Pressable>
              ))}
            </View>

            <ProfileInterestEditor
              tags={draft.interest_tags}
              onChange={(interest_tags) => onChange({ interest_tags })}
            />

            <ProfileBioField bio={draft.bio} onChange={(bio) => onChange({ bio })} />
          </ScrollView>

          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={onCancel}
              className="flex-1 py-3.5 rounded-pill border border-line items-center"
            >
              <Text className="text-white font-semibold">Abbrechen</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={saving}
              className={`flex-1 py-3.5 rounded-pill bg-accent items-center ${saving ? 'opacity-60' : ''}`}
            >
              <Text className="text-white font-semibold">{saving ? 'Speichern…' : 'Speichern'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="text-fg-4 text-[10px] uppercase tracking-widest font-semibold mb-1.5">
      {children}
    </Text>
  );
}

import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionLabel, TitleText, MetaText } from '@/components/ui/Typography';
import {
  BottomSheet,
  BottomSheetPanel,
  BOTTOM_SHEET_MAX_RATIO,
} from '@/components/ui/BottomSheet';
import { ProfileInterestEditor } from '@/components/profile/ProfileInterestEditor';
import { ProfileBioField } from '@/components/profile/ProfileBioField';
import { ProfileLocationBar } from '@/components/profile/ProfileLocationBar';
import { PROFILE_PICK_ONLY_HINT } from '@/lib/marketingCopy';
import { MAX_JOB_LENGTH, MAX_PSEUDONYM_LENGTH } from '@/lib/constants';
import type { Availability, LocationMode } from '@/lib/types';
import { FLING_INPUT_TEXT } from '@/lib/designTokens';
import { useAppDimensions } from '@/hooks/useAppDimensions';

export type ProfileEditDraft = {
  pseudonym: string;
  display_name: string;
  job: string;
  age: string;
  city: string;
  location_mode: LocationMode;
  latitude: number | null;
  longitude: number | null;
  availability: Availability;
  interest_tags: string[];
  bio: string;
};

export function ProfileEditModal({
  visible,
  draft,
  saving,
  detectingLocation,
  onChange,
  onCancel,
  onSave,
  onDetectLocation,
}: {
  visible: boolean;
  draft: ProfileEditDraft;
  saving: boolean;
  detectingLocation?: boolean;
  onChange: (patch: Partial<ProfileEditDraft>) => void;
  onCancel: () => void;
  onSave: () => void;
  onDetectLocation: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useAppDimensions();
  const panelHeight = Math.round(screenH * BOTTOM_SHEET_MAX_RATIO);
  const scrollMaxHeight = Math.max(
    260,
    panelHeight - insets.bottom - 180,
  );

  const footer = (
    <View className="flex-row gap-3">
      <Pressable
        onPress={onCancel}
        className="flex-1 py-3.5 rounded-pill bg-white/[0.06] items-center"
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
  );

  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <BottomSheetPanel maxHeightRatio={BOTTOM_SHEET_MAX_RATIO} footer={footer}>
        <TitleText className="text-center mb-4">Profil bearbeiten</TitleText>

        <ScrollView
          style={{ maxHeight: scrollMaxHeight }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          <FieldLabel>Pseudonym</FieldLabel>
          <TextInput
            value={draft.pseudonym}
            onChangeText={(t) =>
              onChange({ pseudonym: t.slice(0, MAX_PSEUDONYM_LENGTH) })
            }
            className="bg-white/5 border border-line rounded-md px-4 py-3 text-white mb-1"
            style={FLING_INPUT_TEXT}
            placeholderTextColor="rgba(255,255,255,0.35)"
            placeholder="z. B. Lena_M"
            autoCapitalize="none"
          />
          <MetaText className="text-fg-4 mb-4 normal-case">
            Sichtbar in Auswahl und auf deinem Profil
          </MetaText>

          <FieldLabel>Name</FieldLabel>
          <TextInput
            value={draft.display_name}
            onChangeText={(t) => onChange({ display_name: t.slice(0, 32) })}
            className="bg-white/5 border border-line rounded-md px-4 py-3 text-white mb-1"
            style={FLING_INPUT_TEXT}
            placeholderTextColor="rgba(255,255,255,0.35)"
            placeholder="Dein Name"
          />
          <MetaText className="text-fg-4 mb-4 normal-case">
            {PROFILE_PICK_ONLY_HINT}
          </MetaText>

          <FieldLabel>Beruf</FieldLabel>
          <TextInput
            value={draft.job}
            onChangeText={(t) => onChange({ job: t.slice(0, MAX_JOB_LENGTH) })}
            className="bg-white/5 border border-line rounded-md px-4 py-3 text-white mb-4"
            style={FLING_INPUT_TEXT}
            placeholderTextColor="rgba(255,255,255,0.35)"
            placeholder="z.B. Architekt"
          />

          <FieldLabel>Alter</FieldLabel>
          <TextInput
            value={draft.age}
            onChangeText={(t) => onChange({ age: t.replace(/\D/g, '').slice(0, 2) })}
            keyboardType="number-pad"
            className="bg-white/5 border border-line rounded-md px-4 py-3 text-white mb-4"
            style={FLING_INPUT_TEXT}
            placeholderTextColor="rgba(255,255,255,0.35)"
            placeholder="Alter"
          />

          <FieldLabel>Standort</FieldLabel>
          <ProfileLocationBar
            city={draft.city}
            detecting={detectingLocation ?? false}
            onDetectLocation={onDetectLocation}
            embedded
          />

          <ProfileInterestEditor
            tags={draft.interest_tags}
            onChange={(interest_tags) => onChange({ interest_tags })}
          />

          <ProfileBioField bio={draft.bio} onChange={(bio) => onChange({ bio })} />
        </ScrollView>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <SectionLabel className="mb-2">{children}</SectionLabel>;
}

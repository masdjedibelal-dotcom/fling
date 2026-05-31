import { useState } from 'react';
import { View, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { ScreenTitle, BodyText, SectionLabel, MetaText } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { updateUserProfile } from '@/lib/api';
import { INTEREST_TAGS, MAX_BIO_LENGTH, MAX_JOB_LENGTH } from '@/lib/constants';
import { FLING_RADIUS, FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';
import {
  BIO_PLACEHOLDER_FEMALE,
  BIO_PLACEHOLDER_MALE,
  PROFILE_PICK_ONLY_HINT,
} from '@/lib/marketingCopy';

const fieldStyle = {
  fontSize: FLING_TYPE.body,
  lineHeight: 24,
  fontFamily: 'Inter_500Medium' as const,
  borderRadius: FLING_RADIUS.md,
  backgroundColor: FLING_COLORS.card,
};

export default function EditProfileScreen() {
  const userId = useAuthStore((s) => s.userId);
  const gender = useAuthStore((s) => s.gender);
  const profile = useAuthStore((s) => s.profile);
  const bioPlaceholder =
    gender === 'female' ? BIO_PLACEHOLDER_FEMALE : BIO_PLACEHOLDER_MALE;
  const setProfile = useAuthStore((s) => s.setProfile);

  const [bio, setBio] = useState(profile?.bio ?? '');
  const [job, setJob] = useState(profile?.job ?? '');
  const [tags, setTags] = useState<string[]>(profile?.interest_tags ?? []);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 5) return prev;
      return [...prev, tag];
    });
  };

  const save = async () => {
    if (!userId || !profile) return;
    setSaving(true);
    await updateUserProfile(userId, { bio, job, interest_tags: tags });
    setProfile({ ...profile, bio, job, interest_tags: tags });
    setSaving(false);
    router.back();
  };

  return (
    <Screen className="px-4 pt-2">
      <View className="flex-row items-center gap-3 mb-6">
        <BackButton />
        <ScreenTitle className="flex-1">Profil bearbeiten</ScreenTitle>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <SectionLabel>Bio</SectionLabel>
        <TextInput
          value={bio}
          onChangeText={(t) => setBio(t.slice(0, MAX_BIO_LENGTH))}
          multiline
          textAlignVertical="top"
          className="border border-line text-white min-h-[100px] px-4 py-3 mb-1"
          style={fieldStyle}
          placeholderTextColor="rgba(255,255,255,0.38)"
          placeholder={bioPlaceholder}
        />
        <MetaText className="mb-6 normal-case">
          {bio.length} / {MAX_BIO_LENGTH}
        </MetaText>

        <SectionLabel>Beruf</SectionLabel>
        <TextInput
          value={job}
          onChangeText={(t) => setJob(t.slice(0, MAX_JOB_LENGTH))}
          className="border border-line text-white px-4 py-3 mb-1"
          style={fieldStyle}
          placeholderTextColor="rgba(255,255,255,0.38)"
          placeholder="z.B. Architekt"
        />
        <MetaText className="mb-1 normal-case">
          {job.length} / {MAX_JOB_LENGTH}
        </MetaText>
        <MetaText className="text-fg-4 mb-6 normal-case">
          {PROFILE_PICK_ONLY_HINT}
        </MetaText>

        <SectionLabel>Interessen</SectionLabel>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {INTEREST_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className={`px-4 py-2.5 rounded-pill border ${
                  active ? 'bg-accent border-accent' : 'border-line bg-white/5'
                }`}
              >
                <BodyText
                  className={active ? 'text-white font-semibold' : 'text-fg-2'}
                  style={{ fontSize: FLING_TYPE.subhead }}
                >
                  {tag}
                </BodyText>
              </Pressable>
            );
          })}
        </View>

        <Button label="Speichern" loading={saving} onPress={save} />
      </ScrollView>
    </Screen>
  );
}

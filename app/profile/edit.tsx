import { useState } from 'react';
import { View, TextInput, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { updateUserProfile } from '@/lib/api';
import { INTEREST_TAGS, MAX_BIO_LENGTH, MAX_JOB_LENGTH } from '@/lib/constants';

export default function EditProfileScreen() {
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);
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
        <DisplayText className="text-xl">Profil bearbeiten</DisplayText>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <BodyText className="text-fg-4 text-xs uppercase tracking-wider mb-2">
          Bio ({bio.length}/{MAX_BIO_LENGTH})
        </BodyText>
        <TextInput
          value={bio}
          onChangeText={(t) => setBio(t.slice(0, MAX_BIO_LENGTH))}
          multiline
          className="bg-card border border-line rounded-md p-4 text-white min-h-[100px] mb-6"
          placeholderTextColor="rgba(255,255,255,0.3)"
          placeholder="Kurz über dich…"
        />

        <BodyText className="text-fg-4 text-xs uppercase tracking-wider mb-2">
          Beruf ({job.length}/{MAX_JOB_LENGTH})
        </BodyText>
        <TextInput
          value={job}
          onChangeText={(t) => setJob(t.slice(0, MAX_JOB_LENGTH))}
          className="bg-card border border-line rounded-md p-4 text-white mb-6"
          placeholderTextColor="rgba(255,255,255,0.3)"
          placeholder="z.B. Architekt"
        />

        <BodyText className="text-fg-4 text-xs uppercase tracking-wider mb-2">
          Interessen (max. 5)
        </BodyText>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {INTEREST_TAGS.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => toggleTag(tag)}
              className={`px-3 py-2 rounded-pill border ${
                tags.includes(tag) ? 'bg-accent border-accent' : 'border-line'
              }`}
            >
              <BodyText className={tags.includes(tag) ? 'text-white' : 'text-fg-3'}>
                {tag}
              </BodyText>
            </Pressable>
          ))}
        </View>

        <Button label="Speichern" loading={saving} onPress={save} />
      </ScrollView>
    </Screen>
  );
}

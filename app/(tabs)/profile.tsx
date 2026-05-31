import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, Alert, Text, Linking } from 'react-native';
import { FlingScrollView } from '@/components/ui/FlingScrollView';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BodyText, BodyLarge } from '@/components/ui/Typography';
import { SettingsGroup, SettingsRow } from '@/components/ui/SettingsGroup';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfilePhotoRow } from '@/components/profile/ProfilePhotoRow';
import { ProfileStatCards } from '@/components/profile/ProfileStatCards';
import { LEGAL_URLS } from '@/lib/legalUrls';
import {
  ProfileEditModal,
  type ProfileEditDraft,
} from '@/components/profile/ProfileEditModal';
import { signOut } from '@/lib/auth';
import { enrichProfile, updateUserProfile } from '@/lib/api';
import { ensureDemoSession, getDemoUserProfile, isDemoMode } from '@/lib/demoMode';
import { detectCurrentCity } from '@/lib/location';
import { birthDateFromAge, getAgeFromBirthDate } from '@/lib/validation';
import { useAuthStore } from '@/stores/authStore';
import type { Availability, LocationMode, UserProfile } from '@/lib/types';
import { DEFAULT_RADIUS_KM } from '@/lib/constants';
import { ownProfileName } from '@/lib/profileDisplay';
import { FLING_TYPE } from '@/lib/designTokens';

type ProfileDraft = {
  pseudonym: string;
  display_name: string;
  photos: string[];
  job: string;
  age: string;
  city: string;
  location_mode: LocationMode;
  latitude: number | null;
  longitude: number | null;
  interest_tags: string[];
  bio: string;
  birth_date: string | null;
  availability: Availability;
  search_radius_km: number;
};

function draftFromProfile(p: UserProfile): ProfileDraft {
  const age = getAgeFromBirthDate(p.birth_date);
  return {
    pseudonym: p.pseudonym ?? '',
    display_name: p.display_name ?? '',
    photos: p.photos ?? [],
    job: p.job ?? '',
    age: age != null ? String(age) : '',
    city: p.city ?? '',
    location_mode: p.location_mode ?? 'fixed',
    latitude: p.latitude,
    longitude: p.longitude,
    interest_tags: p.interest_tags ?? [],
    bio: p.bio ?? '',
    birth_date: p.birth_date,
    availability: p.availability ?? 'now',
    search_radius_km: p.search_radius_km ?? DEFAULT_RADIUS_KM,
  };
}

function draftToPatch(d: ProfileDraft): Partial<UserProfile> {
  const ageNum = parseInt(d.age, 10);
  const birth_date =
    !Number.isNaN(ageNum) && ageNum >= 18 && ageNum < 100
      ? birthDateFromAge(ageNum)
      : d.birth_date;

  return {
    pseudonym: d.pseudonym.trim() || null,
    display_name: d.display_name.trim() || null,
    photos: d.photos.filter(Boolean).slice(0, 5),
    primary_photo_idx: 0,
    job: d.job.trim() || null,
    bio: d.bio,
    interest_tags: d.interest_tags,
    city: d.city.trim() || null,
    location_mode: d.location_mode,
    latitude: d.latitude,
    longitude: d.longitude,
    birth_date,
    availability: d.availability,
    search_radius_km: d.search_radius_km,
  };
}

function toEditDraft(d: ProfileDraft): ProfileEditDraft {
  return {
    pseudonym: d.pseudonym,
    display_name: d.display_name,
    job: d.job,
    age: d.age,
    city: d.city,
    location_mode: d.location_mode,
    latitude: d.latitude,
    longitude: d.longitude,
    availability: d.availability,
    interest_tags: d.interest_tags,
    bio: d.bio,
  };
}

export default function ProfileScreen() {
  const gender = useAuthStore((s) => s.gender) ?? 'female';
  const userId = useAuthStore((s) => s.userId);
  const rawProfile = useAuthStore((s) => s.profile);
  const verificationStatus = useAuthStore((s) => s.verificationStatus);
  const profile =
    enrichProfile(rawProfile) ??
    (isDemoMode ? getDemoUserProfile(gender) : null);
  const setProfile = useAuthStore((s) => s.setProfile);
  const signOutLocal = useAuthStore((s) => s.signOutLocal);
  const resetOnboarding = useAuthStore((s) => s.resetOnboarding);

  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<ProfileEditDraft | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureDemoSession();
  }, []);

  useEffect(() => {
    if (profile) setDraft(draftFromProfile(profile));
  }, [profile?.id, profile?.updated_at]);

  const persist = useCallback(
    async (next: ProfileDraft) => {
      if (!userId || !profile) return;
      const patch = draftToPatch(next);
      await updateUserProfile(userId, patch);
      setProfile({ ...profile, ...patch });
      setDraft(next);
    },
    [userId, profile, setProfile],
  );

  const handlePhotosChange = async (photos: string[]) => {
    if (!draft) return;
    const next = { ...draft, photos };
    setDraft(next);
    await persist(next);
  };

  const handleDetectAutoInEdit = async () => {
    setDetectingLocation(true);
    const result = await detectCurrentCity();
    setDetectingLocation(false);
    if (!result) {
      Alert.alert(
        'Standort',
        'Standort konnte nicht ermittelt werden. Bitte erlaube den Zugriff in den Geräteeinstellungen und versuche es erneut.',
      );
      return;
    }
    setEditDraft((d) =>
      d
        ? {
            ...d,
            location_mode: 'auto',
            city: result.city,
            latitude: result.latitude,
            longitude: result.longitude,
          }
        : d,
    );
  };

  const openEdit = () => {
    if (!draft) return;
    setEditDraft(toEditDraft(draft));
    setEditOpen(true);
  };

  const cancelEdit = () => {
    setEditOpen(false);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    if (!draft || !editDraft) return;
    setSaving(true);
    const next = { ...draft, ...editDraft };
    await persist(next);
    setSaving(false);
    setEditOpen(false);
    setEditDraft(null);
  };

  const handleSignOut = async () => {
    await signOut();
    signOutLocal();
    resetOnboarding();
    router.replace('/(auth)/age-gate');
  };

  if (!profile || !draft) {
    return (
      <Screen className="items-center justify-center">
        <BodyText>Lädt…</BodyText>
      </Screen>
    );
  }

  const mainPhoto =
    draft.photos[0] ??
    profile.photos[profile.primary_photo_idx] ??
    'https://i.pravatar.cc/400?img=5';

  return (
    <Screen edges={['top']} className="flex-1">
      <FlingScrollView className="flex-1 px-5 pt-3" contentContainerClassName="pb-12">
        <ProfileHero
          photoUri={mainPhoto}
          displayName={ownProfileName(draft.display_name, draft.pseudonym)}
          verified={verificationStatus === 'approved'}
          onAvatarPress={() => setPhotosOpen((v) => !v)}
          onEditPress={openEdit}
        />

        {photosOpen ? (
          <ProfilePhotoRow photos={draft.photos} onChange={handlePhotosChange} />
        ) : null}

        {draft.interest_tags.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 mb-5">
            {draft.interest_tags.map((tag) => (
              <View
                key={tag}
                className="px-3.5 py-2 rounded-pill border border-line"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <Text
                  className="text-white font-semibold"
                  style={{ fontSize: FLING_TYPE.subhead }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <ProfileStatCards
          pseudonym={draft.pseudonym}
          age={draft.age}
          job={draft.job}
        />

        <BodyLarge className="leading-7 mb-8 mt-4">
          {draft.bio || 'Erzähl kurz, wer du bist — das zählt beim Pick.'}
        </BodyLarge>

        <SettingsGroup title="App">
          <SettingsRow
            label="Benachrichtigungen"
            onPress={() => router.push('/profile/settings/notifications')}
          />
          <SettingsRow
            label="Datenschutz"
            onPress={() => Linking.openURL(LEGAL_URLS.privacy)}
          />
          <SettingsRow
            label="AGB"
            onPress={() => Linking.openURL(LEGAL_URLS.terms)}
          />
          <SettingsRow
            label="Impressum"
            onPress={() => Linking.openURL(LEGAL_URLS.imprint)}
          />
          <SettingsRow
            label="Konto & Einstellungen"
            onPress={() => router.push('/profile/settings/account')}
            isLast
          />
        </SettingsGroup>

        {gender === 'male' ? (
          <SettingsGroup title="Account">
            <SettingsRow label="Hilfe" onPress={() => {}} />
            <SettingsRow label="Abmelden" onPress={handleSignOut} destructive />
            <SettingsRow
              label="Konto löschen"
              onPress={() => router.push('/profile/settings/account')}
              isLast
            />
          </SettingsGroup>
        ) : (
          <Pressable onPress={handleSignOut} className="py-5 items-center">
            <Text
              className="text-accent font-semibold"
              style={{ fontSize: FLING_TYPE.callout }}
            >
              Abmelden
            </Text>
          </Pressable>
        )}
      </FlingScrollView>

      {editDraft ? (
        <ProfileEditModal
          visible={editOpen}
          draft={editDraft}
          saving={saving}
          detectingLocation={detectingLocation}
          onChange={(patch) => setEditDraft((d) => (d ? { ...d, ...patch } : d))}
          onCancel={cancelEdit}
          onSave={saveEdit}
          onDetectLocation={handleDetectAutoInEdit}
        />
      ) : null}
    </Screen>
  );
}

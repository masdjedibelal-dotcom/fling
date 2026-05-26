import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfilePhotoRow } from '@/components/profile/ProfilePhotoRow';
import { ProfileStatCards } from '@/components/profile/ProfileStatCards';
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

function SectionCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; sub?: string; onPress: () => void }[];
}) {
  return (
    <View className="mb-5">
      <BodyText className="text-fg-4 text-[10px] uppercase tracking-widest mb-2 px-1">
        {title}
      </BodyText>
      <View className="bg-card border border-line rounded-md overflow-hidden">
        {rows.map((row, i) => (
          <Pressable
            key={row.label}
            onPress={row.onPress}
            className={`flex-row justify-between items-center px-4 py-3.5 ${
              i < rows.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            <View>
              <BodyText className="text-white font-semibold">{row.label}</BodyText>
              {row.sub ? (
                <BodyText className="text-fg-3 text-xs mt-0.5">{row.sub}</BodyText>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

type ProfileDraft = {
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
    display_name: d.display_name,
    job: d.job,
    age: d.age,
    city: d.city,
    location_mode: d.location_mode,
    latitude: d.latitude,
    longitude: d.longitude,
    search_radius_km: d.search_radius_km,
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
        'Bitte erlaube den Standortzugriff in den Geräteeinstellungen.',
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
    draft.photos[draft.photos.length > 0 ? 0 : 0] ??
    profile.photos[profile.primary_photo_idx] ??
    'https://i.pravatar.cc/400?img=5';

  return (
    <Screen edges={['top']} className="flex-1">
      <ScrollView className="flex-1 px-4 pt-2" contentContainerClassName="pb-10">
        <DisplayText className="text-lg mb-4 tracking-tight">Profil</DisplayText>

        <ProfileHero
          photoUri={mainPhoto}
          displayName={draft.display_name || 'Profil'}
          verified={verificationStatus === 'approved'}
          onAvatarPress={() => setPhotosOpen((v) => !v)}
          onEditPress={openEdit}
        />

        {photosOpen ? (
          <ProfilePhotoRow photos={draft.photos} onChange={handlePhotosChange} />
        ) : null}

        {/* Reihenfolge wie Schaufenster-Detail: Pills → Karten → Bio */}
        <View className="flex-row flex-wrap gap-1.5 mb-4">
          {draft.interest_tags.map((tag) => (
            <View
              key={tag}
              className="px-2.5 py-1 rounded-pill bg-white/5 border border-line"
            >
              <BodyText className="text-white text-[11.5px] font-semibold">{tag}</BodyText>
            </View>
          ))}
        </View>

        <ProfileStatCards job={draft.job} age={draft.age} city={draft.city} />

        <BodyText className="text-fg-4 text-[11px] mb-3 px-1 font-mono tracking-wide">
          {draft.availability === 'now'
            ? 'Verfügbarkeit: Jetzt'
            : draft.availability === 'today'
              ? 'Verfügbarkeit: Heute'
              : 'Verfügbarkeit: Pause'}
          {' · '}
          {draft.search_radius_km} km
          {' · '}
          {draft.location_mode === 'auto' ? 'Standort aktiv' : 'Ort fest'}
        </BodyText>

        <BodyText className="text-fg-2 leading-6 mb-6">
          {draft.bio || 'Noch keine Bio.'}
        </BodyText>

        <View className="h-px bg-line mb-5" />

        <SectionCard
          title="App"
          rows={[
            {
              label: 'Benachrichtigungen',
              onPress: () => router.push('/profile/settings/notifications'),
            },
            { label: 'Datenschutz', onPress: () => {} },
            {
              label: 'App-Einstellungen',
              onPress: () => router.push('/profile/settings/account'),
            },
            ...(isDemoMode && gender === 'female'
              ? [
                  {
                    label: 'Safe Pick · Team',
                    sub: 'Interne Übersicht (Demo)',
                    onPress: () => router.push('/profile/settings/team-safe-picks'),
                  },
                ]
              : []),
          ]}
        />

        {gender === 'male' ? (
          <SectionCard
            title="Account"
            rows={[
              { label: 'Hilfe', onPress: () => {} },
              { label: 'Abmelden', onPress: handleSignOut },
              {
                label: 'Konto löschen',
                onPress: () => router.push('/profile/settings/account'),
              },
            ]}
          />
        ) : (
          <Pressable onPress={handleSignOut} className="py-4 items-center">
            <BodyText className="text-accent font-semibold">Abmelden</BodyText>
          </Pressable>
        )}
      </ScrollView>

      {editDraft ? (
        <ProfileEditModal
          visible={editOpen}
          draft={editDraft}
          saving={saving}
          gender={gender}
          detectingLocation={detectingLocation}
          onChange={(patch) => setEditDraft((d) => (d ? { ...d, ...patch } : d))}
          onCancel={cancelEdit}
          onSave={saveEdit}
          onDetectAutoLocation={handleDetectAutoInEdit}
        />
      ) : null}
    </Screen>
  );
}

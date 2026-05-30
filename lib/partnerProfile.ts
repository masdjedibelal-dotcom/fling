import { formatDistance } from '@/lib/profileStatus';
import { getAgeFromBirthDate } from '@/lib/validation';
import type { SchaufensterProfile, UserProfile } from '@/lib/types';

/** Öffentliche Partner-Ansicht (Schaufenster-Layout) */
export function userProfileToSchaufenster(p: UserProfile): SchaufensterProfile {
  const age = getAgeFromBirthDate(p.birth_date) ?? 25;
  return {
    id: p.id,
    pseudonym: p.pseudonym ?? 'Profil',
    display_name: p.display_name ?? 'Profil',
    age,
    photos: p.photos?.length ? p.photos : ['https://i.pravatar.cc/600?img=5'],
    primary_photo_idx: p.primary_photo_idx ?? 0,
    job: p.job ?? '—',
    distance_km: 0,
    availability: p.availability ?? 'now',
    verified_at: new Date().toISOString(),
    bio: p.bio ?? '',
    interest_tags: p.interest_tags ?? [],
    last_seen_minutes: 2,
  };
}

export type ProfileStat = { label: string; value: string };

export function statsForMaleProfile(p: SchaufensterProfile): ProfileStat[] {
  return [
    { label: 'Pseudonym', value: p.pseudonym || '—' },
    { label: 'Distanz', value: formatDistance(p.distance_km) },
  ];
}

export function statsForFemaleProfile(p: SchaufensterProfile, city?: string | null): ProfileStat[] {
  return [
    { label: 'Pseudonym', value: p.pseudonym || '—' },
    { label: 'Ort', value: city ?? '—' },
  ];
}

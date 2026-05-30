import type { SchaufensterProfile } from '@/lib/types';

/** Öffentliche Kachel / Detail — nur Pseudonym, keine Chat-Daten */
export function toPublicSchaufensterProfile(
  p: SchaufensterProfile,
): SchaufensterProfile {
  const legacy = (p as SchaufensterProfile & { display_name?: string }).display_name;
  return {
    id: p.id,
    pseudonym: (p.pseudonym ?? legacy)?.trim() || 'Profil',
    photos: p.photos ?? [],
    primary_photo_idx: p.primary_photo_idx ?? 0,
    distance_km: p.distance_km ?? 0,
    availability: p.availability ?? 'off',
    verified_at: p.verified_at ?? '',
    bio: p.bio ?? '',
    interest_tags: p.interest_tags ?? [],
    last_seen_minutes: p.last_seen_minutes ?? 0,
    age: p.age,
    job: p.job,
    city: p.city,
  };
}

/** Nach Match — inkl. Name, Beruf, Alter für Chat */
export function toMatchPartnerProfile(
  p: SchaufensterProfile,
): SchaufensterProfile {
  const legacy = (p as SchaufensterProfile & { display_name?: string }).display_name;
  return {
    ...toPublicSchaufensterProfile(p),
    display_name: (p.display_name ?? legacy)?.trim() || 'Profil',
    job: p.job ?? '',
    age: p.age ?? 25,
  };
}

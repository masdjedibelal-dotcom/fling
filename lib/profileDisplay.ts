import { formatDistance } from '@/lib/profileStatus';
import type { SchaufensterProfile } from '@/lib/types';

/** Öffentliches Pseudonym */
export function profilePseudonym(
  pseudonym: string | null | undefined,
  fallback = 'Profil',
): string {
  const t = pseudonym?.trim();
  return t || fallback;
}

/** Echter Name — nur Pick-Chat; sonst Pseudonym als Fallback */
export function chatPartnerName(
  displayName: string | null | undefined,
  fallback = 'Profil',
): string {
  const name = displayName?.trim();
  return name || fallback;
}

/** Eigenes Profil / Chat — Name, sonst Pseudonym */
export function ownProfileName(
  displayName: string | null | undefined,
  pseudonym?: string | null,
): string {
  return displayName?.trim() || pseudonym?.trim() || 'Profil';
}

/** Meta unter dem Namen im Pick-Chat — Alter · Beruf · Distanz/Ort */
export function formatChatPartnerMeta(
  profile: SchaufensterProfile,
  options?: { city?: string | null },
): string {
  const job = profile.job?.trim() || '—';
  const age =
    profile.age != null && profile.age > 0 ? String(profile.age) : '—';
  const place =
    options?.city !== undefined
      ? options.city?.trim() || '—'
      : formatDistance(profile.distance_km);
  return `${age} · ${job} · ${place}`;
}

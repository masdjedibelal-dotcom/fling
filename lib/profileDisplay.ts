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

/** Echter Name — nur Pick-Chat */
export function chatPartnerName(
  displayName: string | null | undefined,
  fallback = 'Profil',
): string {
  const t = displayName?.trim();
  return t || fallback;
}

/** Meta unter dem Namen im Pick-Chat — Beruf · Distanz/Ort · Alter */
export function formatChatPartnerMeta(
  profile: SchaufensterProfile,
  options?: { city?: string | null },
): string {
  const job = profile.job?.trim() || '—';
  const age =
    profile.age != null && profile.age > 0 ? String(profile.age) : '—';
  if (options?.city !== undefined) {
    return `${job} · ${options.city?.trim() || '—'} · ${age}`;
  }
  return `${job} · ${formatDistance(profile.distance_km)} · ${age}`;
}

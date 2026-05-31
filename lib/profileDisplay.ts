import { formatDistance } from '@/lib/profileStatus';
import { getProfileMediaUri, getProfileThumbnailUri } from '@/lib/profileMedia';
import type { SchaufensterProfile } from '@/lib/types';

const PICK_PHOTO_FALLBACK = 'https://i.pravatar.cc/400?img=32';

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

/** Avatar / Pick / Chat — erstes Bild (Videos überspringen), nie `video:` als Image-URI */
export function getProfileAvatarUri(
  photos: string[] | undefined | null,
  primaryPhotoIdx?: number | null,
  fallback = PICK_PHOTO_FALLBACK,
): string {
  if (!photos?.length) return fallback;
  const thumb = getProfileThumbnailUri(photos);
  if (thumb) return thumb;
  const idx = Math.min(primaryPhotoIdx ?? 0, photos.length - 1);
  const raw = photos[idx] ?? photos[0];
  if (!raw?.trim()) return fallback;
  if (raw.startsWith('video:')) return fallback;
  return getProfileMediaUri(raw);
}

/** Pick-Tab / Chat-Partner */
export function getPickPartnerPhotoUri(profile?: SchaufensterProfile): string {
  return getProfileAvatarUri(profile?.photos, profile?.primary_photo_idx);
}

/** Nach Pick: echter Name, sonst Pseudonym */
export function getPickPartnerName(
  profile: SchaufensterProfile | undefined,
  options: { viewerIsFemale: boolean; femaleDisplayName?: string | null },
): string {
  if (!profile) return '—';
  if (options.viewerIsFemale) {
    return chatPartnerName(
      profile.display_name,
      profilePseudonym(profile.pseudonym, 'Pick'),
    );
  }
  return chatPartnerName(
    options.femaleDisplayName ?? profile.display_name,
    profilePseudonym(profile.pseudonym, 'Anna'),
  );
}

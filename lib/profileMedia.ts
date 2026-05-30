/** Medien in `users.photos`: Bild-URL oder `video:<url>` für Kurzvideos. */
export const PROFILE_VIDEO_PREFIX = 'video:';
export const MAX_PROFILE_VIDEO_SEC = 3;

export function isProfileVideo(stored: string): boolean {
  if (!stored) return false;
  if (stored.startsWith(PROFILE_VIDEO_PREFIX)) return true;
  return /\.(mp4|mov|m4v|webm)(\?|$)/i.test(stored);
}

export function getProfileMediaUri(stored: string): string {
  if (stored.startsWith(PROFILE_VIDEO_PREFIX)) {
    return stored.slice(PROFILE_VIDEO_PREFIX.length);
  }
  return stored;
}

export function toProfileVideoStorage(uri: string): string {
  if (uri.startsWith(PROFILE_VIDEO_PREFIX)) return uri;
  return `${PROFILE_VIDEO_PREFIX}${uri}`;
}

/** Kachel-Vorschaubild: erstes Foto (kein Video). */
export function getProfileThumbnailUri(photos: string[]): string | undefined {
  const image = photos.find((p) => p && !isProfileVideo(p));
  if (image) return getProfileMediaUri(image);
  const first = photos.find(Boolean);
  return first ? getProfileMediaUri(first) : undefined;
}

import type { SchaufensterProfile } from './types';

export function formatDistance(km: number): string {
  if (km < 1) return `${km.toFixed(1)} km`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** Distanz-Label auf Schaufenster-Kacheln */
export function tileDistanceLabel(profile: SchaufensterProfile): string {
  return formatDistance(profile.distance_km);
}

/** Kompakte Zeit-Labels (Profil-Detail o. ä.) */
export function tileStatusLabel(profile: SchaufensterProfile): string {
  const { label } = onlineStatus(profile);
  if (label === 'Jetzt') return 'jetzt';
  if (label === 'Heute') return 'heute';
  if (label.startsWith('vor ')) return label.slice(4);
  return label.toLowerCase();
}

/** Grün = jetzt aktiv, Gelb = heute, Schwarz = offline / inaktiv */
export function onlineStatus(profile: SchaufensterProfile): {
  label: string;
  dotColor: string;
} {
  if (profile.availability === 'off') {
    return { label: '', dotColor: '#0d0d0d' };
  }
  if (profile.availability === 'now' || profile.last_seen_minutes <= 2) {
    return { label: 'Jetzt', dotColor: '#00e07a' };
  }
  if (profile.availability === 'today' || profile.last_seen_minutes >= 60) {
    return { label: 'Heute', dotColor: '#f0c040' };
  }
  return {
    label: `vor ${profile.last_seen_minutes} min`,
    dotColor: '#0d0d0d',
  };
}

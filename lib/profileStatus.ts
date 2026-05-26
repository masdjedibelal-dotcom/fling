import type { SchaufensterProfile } from './types';

export function formatDistance(km: number): string {
  if (km < 1) return `${km.toFixed(1)} km`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/** Kompakte, lowercase Labels für Auswahl-Kacheln (Mock-Typo) */
export function tileStatusLabel(profile: SchaufensterProfile): string {
  const { label } = onlineStatus(profile);
  if (label === 'Jetzt') return 'jetzt';
  if (label === 'Heute') return 'heute';
  if (label.startsWith('vor ')) return label.slice(4);
  return label.toLowerCase();
}

export function onlineStatus(profile: SchaufensterProfile): {
  label: string;
  dotColor: string;
} {
  if (profile.availability === 'now' || profile.last_seen_minutes <= 2) {
    return { label: 'Jetzt', dotColor: '#00e07a' };
  }
  if (profile.availability === 'today' || profile.last_seen_minutes >= 60) {
    return { label: 'Heute', dotColor: '#f0c040' };
  }
  return {
    label: `vor ${profile.last_seen_minutes} min`,
    dotColor: 'rgba(255,255,255,0.35)',
  };
}

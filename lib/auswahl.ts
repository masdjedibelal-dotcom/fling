import {
  AUSWAHL_LAST_SEEN_MAX_MINUTES,
  AUSWAHL_MAX_PROFILES,
  AUSWAHL_MAX_RADIUS_KM,
} from './constants';
import type { SchaufensterProfile } from './types';

/** Im Radius und kürzlich aktiv (Jetzt oder zuletzt online) — keine Nutzer-Filter. */
export function isAuswahlEligible(profile: SchaufensterProfile): boolean {
  if (profile.distance_km > AUSWAHL_MAX_RADIUS_KM) return false;
  if (profile.availability === 'off') return false;

  if (profile.availability === 'now' || profile.last_seen_minutes <= 15) {
    return true;
  }

  if (profile.availability === 'today') {
    return profile.last_seen_minutes <= AUSWAHL_LAST_SEEN_MAX_MINUTES;
  }

  return profile.last_seen_minutes <= AUSWAHL_LAST_SEEN_MAX_MINUTES;
}

function activityRank(profile: SchaufensterProfile): number {
  if (profile.availability === 'now' || profile.last_seen_minutes <= 5) return 0;
  return 1;
}

/** Sortierung: online zuerst, dann frisch gesehen, dann näher. */
export function sortAuswahlProfiles(
  profiles: SchaufensterProfile[],
): SchaufensterProfile[] {
  return [...profiles].sort((a, b) => {
    const rank = activityRank(a) - activityRank(b);
    if (rank !== 0) return rank;
    if (a.last_seen_minutes !== b.last_seen_minutes) {
      return a.last_seen_minutes - b.last_seen_minutes;
    }
    return a.distance_km - b.distance_km;
  });
}

export function prepareAuswahlProfiles(
  raw: SchaufensterProfile[],
): SchaufensterProfile[] {
  return sortAuswahlProfiles(raw.filter(isAuswahlEligible)).slice(
    0,
    AUSWAHL_MAX_PROFILES,
  );
}

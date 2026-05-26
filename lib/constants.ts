export const INTEREST_TAGS = [
  'Sport',
  'Musik',
  'Reisen',
  'Kochen',
  'Kino',
  'Kunst',
  'Lesen',
  'Fitness',
  'Tanzen',
  'Fotografie',
  'Natur',
  'Wein',
  'Architektur',
  'Mode',
  'Gaming',
] as const;

export const REPORT_REASONS = [
  'Fake Profil',
  'Unangemessenes Foto',
  'Belästigung',
  'Minderjährig',
  'Spam',
] as const;

export const MAX_MESSAGE_LENGTH = 160;
export const MAX_PHOTOS = 5;
export const MAX_BIO_LENGTH = 160;
export const MAX_JOB_LENGTH = 24;
export const MAX_CITY_LENGTH = 40;
export const MAX_INTEREST_TAGS = 5;
export const DEFAULT_RADIUS_KM = 5;
export const MAX_RADIUS_KM = 50;

/** Frauen-Auswahl: fest im Hintergrund, nicht nutzersteuerbar */
export const AUSWAHL_MAX_RADIUS_KM = 10;
export const AUSWAHL_MAX_PROFILES = 12;
/** „Zuletzt online“ — max. Fenster in Minuten (24h) */
export const AUSWAHL_LAST_SEEN_MAX_MINUTES = 24 * 60;
export const MATCH_DURATION_HOURS = 24;

export const SAFE_PICK_AREA_MAX = 80;
export const SAFE_PICK_CONTEXT_MAX = 120;
export const SAFE_PICK_NOTE_MAX = 200;
export const SAFE_PICK_CHECK_IN_DELAYS = [60, 120, 180] as const;
export const SAFE_PICK_MEET_HOURS = [18, 19, 20, 21, 22, 23] as const;

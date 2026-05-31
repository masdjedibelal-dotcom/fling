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
export const MESSAGE_LIMIT_HINT = 'Maximal 160 Zeichen.';
export const MAX_PHOTOS = 5;
export const MAX_BIO_LENGTH = 280;
export const MAX_JOB_LENGTH = 24;
export const MAX_PSEUDONYM_LENGTH = 32;
export const MAX_CITY_LENGTH = 40;
export const MAX_INTEREST_TAGS = 5;
export const DEFAULT_RADIUS_KM = 5;
export const MAX_RADIUS_KM = 50;

/** Frauen-Auswahl: fest im Hintergrund, nicht nutzersteuerbar */
export const AUSWAHL_MAX_RADIUS_KM = 10;
export const AUSWAHL_MAX_PROFILES = 20;
/** „Zuletzt online“ — max. Fenster in Minuten (24h) */
export const AUSWAHL_LAST_SEEN_MAX_MINUTES = 24 * 60;
export const MATCH_DURATION_HOURS = 24;

/** Sprachnotiz im Chat */
export const MAX_VOICE_NOTE_SEC = 6;
export const MAX_VOICE_NOTE_MS = MAX_VOICE_NOTE_SEC * 1000;


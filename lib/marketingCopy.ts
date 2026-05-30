/** Zentrale Marketing- und Push-Copy — eine Quelle für App + Store */

export const WELCOME_TAGLINE =
  'Manche Abende brauchen keinen Plan. Nur die richtige Entscheidung.';

export const STORE_SUBLINE = 'Dein Abenteuer. Deine Entscheidung.';

export const STORE_DESCRIPTION_OPENING = STORE_SUBLINE;

export const ONBOARDING_FEMALE_TITLE = 'Ein Pick.\nEin Chat.\n24 Stunden.';

export const ONBOARDING_FEMALE_BODY = 'Kein Scrollen. Nur einer. Nur jetzt.';

export const ONBOARDING_FEMALE_POINTS = [
  'Du siehst wer gerade in der Nähe ist.',
  'Du wählst.',
  'Er wartet.',
] as const;

export const ONBOARDING_MALE_VERIFY =
  'Jedes Mitglied ist verifiziert. Männer einen Schritt weiter.';

export const EXPIRED_BODY = 'Kein Verlauf. Keine Spuren. Nichts.';

/** Kurzformen für Push — knapp, ohne Marketing-Floskeln */
export const PUSH_COPY = {
  new_match: 'Gepickt. 24 Stunden.',
  new_message: 'Neue Nachricht.',
  warning_6h: 'Noch 6 Stunden.',
  warning_1h: 'Noch 1 Stunde.',
  expired: '24 Stunden vorbei.',
  man_cancelled: 'Unpick.',
  woman_cancelled: 'Chat beendet.',
} as const;

export type PushCopyKey = keyof typeof PUSH_COPY;

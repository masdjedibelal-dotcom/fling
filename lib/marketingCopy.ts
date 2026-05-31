import { AUSWAHL_MAX_PROFILES, AUSWAHL_MAX_RADIUS_KM } from './constants';

/** Zentrale App-Copy — USP: Frauen wählen, diskret bis Pick, 24h Chat */

export const STORE_SUBLINE = 'Such dir dein Abenteuer.';

export const STORE_DESCRIPTION_OPENING = STORE_SUBLINE;

// —— Welcome (finale Version) ——
export const WELCOME_HEADLINE = 'Such dir dein Abenteuer.';

export const WELCOME_BODY =
  'Du siehst verifizierte Männer in deiner Nähe.\nDiskret angezeigt. Erst nach deinem Pick wird es persönlich.';

export const WELCOME_BODY_2 = 'Dann öffnet sich euer Chat für 24 Stunden.';

export const WELCOME_FOOTER = 'Ab 18 · Verifiziert · Diskret';

// Legacy alias
export const WELCOME_TAGLINE = WELCOME_HEADLINE;

// —— Onboarding Frau (3 Schritte) ——
export const ONBOARDING_FEMALE_STEPS = [
  {
    step: 1,
    title: 'Du suchst kein Match.\nDu suchst ein Abenteuer.',
    body: 'Auf Fling findest du Männer in deiner Nähe, die gerade aktiv sind.\n\nDu wirst nicht angeschrieben.\nDu wirst nicht überflutet.\nDu wählst.',
    points: [] as string[],
  },
  {
    step: 2,
    title: 'Erst neugierig.\nDann persönlich.',
    body: 'Vor dem Pick siehst du nur Pseudonym, Bilder und kurze Infos.\n\nName, Alter und Beruf öffnen sich erst, wenn du ihn pickst.\n\nSo bleibt es diskret — bis du mehr sehen willst.',
    points: [] as string[],
  },
  {
    step: 3,
    title: 'Ein Pick.\n24 Stunden.',
    body: 'Wenn du ihn pickst, startet euer Chat.\n\nNicht für wochenlanges Schreiben.\nSondern für einen Abend, der konkret werden kann.\n\nNur die letzten Nachrichten bleiben sichtbar.\nFotos sind standardmäßig einmalig.',
    points: [] as string[],
  },
] as const;

/** Kurzform Onboarding Frau (finale) */
export const ONBOARDING_FEMALE_FINAL = {
  title: 'Du wählst.',
  body: 'Männer können dich nicht einfach anschreiben.\n\nDu siehst verifizierte Männer in deiner Nähe und entscheidest, wen du für 24 Stunden pickst.\n\nVor dem Pick bleibt vieles diskret.\nNach dem Pick öffnet sich mehr.',
} as const;

// —— Onboarding Mann (3 Schritte) ——
export const ONBOARDING_MALE_STEPS = [
  {
    step: 1,
    title: 'Frauen suchen hier Abenteuer.',
    body: 'Nicht endlose Matches.\nNicht Smalltalk ohne Ziel.\n\nDu bist sichtbar für Frauen in deiner Nähe — aber du kannst nicht wahllos anschreiben.',
    points: ['Max. 5 Fotos — Qualität vor Quantität'],
  },
  {
    step: 2,
    title: 'Wenn sie dich pickt,\nist Interesse da.',
    body: 'Vor dem Pick sieht sie nur Pseudonym, Bilder und kurze Infos.\n\nNach dem Pick öffnet sich mehr: Name, Alter, Beruf und euer Chat.',
    points: [] as string[],
  },
  {
    step: 3,
    title: 'Du hast\n24 Stunden.',
    body: 'Wenn sie dich pickt, läuft euer Chat für 24 Stunden.\n\nSei klar.\nSei charmant.\nMach einen Vorschlag.\n\nFling ist nicht für ewiges Schreiben gemacht.',
    points: [] as string[],
  },
] as const;

export const ONBOARDING_MALE_FINAL = {
  title: 'Du bist sichtbar.',
  body: 'Frauen suchen hier bewusst nach einem Abenteuer.\n\nDu kannst nicht zuerst schreiben.\nWenn sie dich pickt, öffnet sich euer Chat für 24 Stunden.\n\nDann zählt Klarheit.',
} as const;

export const ONBOARDING_MALE_VERIFY =
  'Jedes Mitglied ist verifiziert. Männer einen Schritt weiter.';

// Legacy
export const ONBOARDING_FEMALE_TITLE = ONBOARDING_FEMALE_STEPS[2].title;
export const ONBOARDING_FEMALE_BODY = ONBOARDING_FEMALE_STEPS[0].body;
export const ONBOARDING_FEMALE_POINTS = [
  'Du wählst.',
  'Diskret bis zum Pick.',
  '24 Stunden Chat.',
] as const;

// —— Vertrauen / Datenschutz ——
export const TRUST_COPY =
  'Diskret. Aber nicht anonym.\n\nAlle Profile werden verifiziert.\n\nVor dem Pick bleiben persönliche Details reduziert.\nNach dem Pick öffnet sich der Chat für 24 Stunden.\n\nNur die letzten Nachrichten bleiben sichtbar.\nFotos sind standardmäßig einmalig.\n\nSo bleibt Fling direkt, privat und sicherer.';

// —— Auswahl ——
export const AUSWAHL_HEADER_TITLE = 'Männer in deiner Nähe';

export const AUSWAHL_HEADER_SUB =
  'Verifiziert. Aktiv. Diskret angezeigt.\n\nDu siehst zuerst nur einen Ausschnitt.\nWenn dich jemand reizt, pickst du ihn.';

export const AUSWAHL_HEADER_DETAIL = `${AUSWAHL_MAX_PROFILES} Männer · ${AUSWAHL_MAX_RADIUS_KM} km · gerade aktiv`;

export const AUSWAHL_BEFORE_PICK_HINT =
  'Noch diskret — Name, Alter und Beruf siehst du erst nach deinem Pick.';

export const AUSWAHL_EMPTY_TITLE = 'Gerade niemand aktiv';

export const AUSWAHL_EMPTY_BODY =
  'In deiner Nähe ist momentan niemand verfügbar.\n\nErweitere deinen Radius oder schau später nochmal rein.';

// —— Mann Sichtbarkeit ——
export const MALE_VISIBILITY_TITLE = 'Du bist sichtbar';

export const MALE_VISIBILITY_BODY =
  'Frauen in deiner Nähe können dich sehen, wenn du aktiv bist.\n\nVor dem Pick bleibst du reduziert sichtbar.\nNach dem Pick öffnet sich dein Profil und der Chat startet für 24 Stunden.';

export const MALE_CANNOT_WRITE_FIRST =
  'Du kannst nicht zuerst schreiben.\n\nFrauen suchen hier bewusst.\nWenn sie dich pickt, will sie mehr sehen.';

// —— Pick ——
export const PICK_CONFIRM_FEMALE = {
  title: 'Ihn für 24 Stunden picken?',
  message: (name: string) =>
    `Mit deinem Pick öffnest du sein Profil und euren Chat.\n\nName, Alter und Beruf werden sichtbar.\nDer Chat läuft 24 Stunden.\n\nWenn es passt, macht es konkret.`,
  confirm: 'Picken',
  cancel: 'Noch schauen',
} as const;

export const PICK_CONFIRM_ALT = {
  title: 'Dein Abenteuer für heute?',
  message:
    'Wenn du ihn pickst, öffnet sich euer Chat für 24 Stunden.\n\nDiskret. Direkt. Ohne endloses Hin und Her.',
  confirm: 'Pick setzen',
  cancel: 'Weitersehen',
} as const;

export const PICK_AFTER_FEMALE = {
  title: 'Dein Pick steht.',
  body: 'Du siehst jetzt mehr von ihm.\n\nDer Chat ist für 24 Stunden offen.\nJetzt könnt ihr herausfinden, ob aus Interesse ein Abend wird.',
} as const;

export const PICK_AFTER_MALE = {
  title: 'Sie hat dich gepickt.',
  body: 'Sie wollte mehr von dir sehen.\n\nDer Chat ist jetzt für 24 Stunden offen.\nMach es nicht kompliziert.',
} as const;

export const PICK_CELEBRATION = {
  line1: 'Dein Pick steht.',
  line2: '24 Stunden.',
} as const;

// —— Chat ——
export const CHAT_INTRO =
  '24 Stunden laufen.\n\nIhr habt jetzt Zeit, herauszufinden, ob ihr euch sehen wollt.\n\nNicht zerreden.\nKonkret werden.';

export const CHAT_PRIVACY_HINT =
  'Nur die letzten Nachrichten bleiben sichtbar.\nFotos sind standardmäßig nur einmal sichtbar.';

export const CHAT_INPUT_PLACEHOLDER = 'Mach einen Vorschlag…';

export const CHAT_PHOTO_ONCE_HINT =
  'Dieses Foto kann nur einmal geöffnet werden.';

export const CHAT_PHOTO_SHEET = {
  title: 'Einmal-Foto senden',
  hint: CHAT_PHOTO_ONCE_HINT,
  camera: 'Foto machen',
  gallery: 'Aus Galerie wählen',
  cancel: 'Abbrechen',
} as const;

export const CHAT_LAST_HOUR_HINT =
  'Wenn ihr euch sehen wollt, macht es jetzt konkret.';

export const EXPIRED_TITLE = 'Die 24 Stunden sind vorbei.';

export const EXPIRED_BODY =
  'Der Chat wurde geschlossen und ist nicht mehr sichtbar.';

export const EXPIRED_SUB = '';

// —— Profil ——
export const PROFILE_INTRO_MALE =
  'Zeig dich klar.\n\nFrauen suchen hier kein endloses Chatten.\n\nEin gutes Bild.\nEin ehrlicher Satz.\nEin Profil, das neugierig macht.\n\nMehr braucht es am Anfang nicht.';

export const PROFILE_INTRO_FEMALE =
  'Du wählst dein Abenteuer.\n\nDu siehst Männer in deiner Nähe erst reduziert.\n\nWenn dich jemand interessiert, pickst du ihn.\nErst dann wird es persönlicher.';

export const PROFILE_PICK_ONLY_HINT =
  'Diese Angaben werden erst nach einem Pick sichtbar.';

export const BIO_PLACEHOLDER_MALE = 'Spontan, direkt, diskret.';

export const BIO_PLACEHOLDER_FEMALE =
  'Wenn ich picke, will ich kein endloses Schreiben.';

// —— Pick Tab ——
export const PICK_TAB_ACTIVE = 'Dein Pick';

export const PICK_TAB_EMPTY_FEMALE = {
  title: 'Such dir\ndein Abenteuer.',
  body: 'Du hast aktuell keinen Pick. Schau in der Auswahl, wer aktiv ist — und pick ihn für 24 Stunden.',
  cta: 'Zur Auswahl',
} as const;

export const PICK_TAB_EMPTY_MALE = {
  title: 'Du bist\nsichtbar.',
  body: 'Frauen suchen hier bewusst. Wenn sie dich pickt, öffnet sich euer Chat für 24 Stunden.',
} as const;

export const PICK_TAB_MATCHED_MALE = 'Sie hat dich gepickt · Chat öffnen ›';

// —— Push ——
export const PUSH_COPY = {
  female_nearby: 'Neue Männer in deiner Nähe. Verifiziert und gerade aktiv.',
  female_pick_open: 'Dein Pick ist offen. Du siehst jetzt mehr.',
  new_message: 'Neue Nachricht. Dein 24h-Chat läuft.',
  warning_1h: 'Noch 1 Stunde. Wenn es passt, macht es konkret.',
  expired: 'Zeit vorbei. Der Chat wurde geschlossen.',
  male_visible: 'Du bist sichtbar. Frauen in deiner Nähe können dich jetzt sehen.',
  male_picked: 'Sie hat dich gepickt. Der Chat ist 24 Stunden offen.',
  new_match: 'Sie hat dich gepickt. Der Chat ist 24 Stunden offen.',
  warning_6h: 'Noch 6 Stunden.',
  man_cancelled: 'Unpick.',
  woman_cancelled: 'Chat beendet.',
} as const;

export type PushCopyKey = keyof typeof PUSH_COPY;

// Claims (Store / Marketing)
export const APP_CLAIMS = [
  'Such dir dein Abenteuer.',
  'Frauen wählen. Männer sind sichtbar.',
  'Ein Pick. 24 Stunden.',
  'Verifizierte Männer in deiner Nähe.',
  'Diskret bis zum Pick. Persönlich danach.',
] as const;

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AvailabilityFilter,
  Match,
  Message,
  SchaufensterProfile,
  UserProfile,
} from './types';
import { toMatchPartnerProfile, toPublicSchaufensterProfile } from './schaufensterProfile';
import {
  demoVideoUri,
  DEMO_VIDEO_BBB,
  DEMO_VIDEO_FLOWER,
} from './demoVideos';

type DemoMaleRow = Omit<SchaufensterProfile, 'pseudonym'> & {
  display_name: string;
  job: string;
  age: number;
  pseudonym?: string;
};

function demoPseudonym(displayName: string, id: string): string {
  if (id === 'demo-m-far') return 'Paul_99';
  if (id === 'demo-m-offline') return 'Max_off';
  return `${displayName.replace(/\s/g, '_')}_M`;
}

function rowToDemoMale(row: DemoMaleRow): SchaufensterProfile {
  return {
    ...row,
    pseudonym: row.pseudonym ?? demoPseudonym(row.display_name, row.id),
  };
}

/** 20 Männer im Schaufenster (Demo / Browser ohne Supabase) */
const DEMO_MALE_ROWS: DemoMaleRow[] = [
  {
    id: 'demo-m1',
    display_name: 'Leon',
    age: 31,
    photos: [
      'https://i.pravatar.cc/600?img=12',
      'https://i.pravatar.cc/600?img=13',
    ],
    primary_photo_idx: 0,
    job: 'Architekt',
    distance_km: 0.3,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Design, gute Gespräche, spontane Pläne.',
    interest_tags: ['Architektur', 'Kunst', 'Reisen'],
    last_seen_minutes: 2,
  },
  {
    id: 'demo-m2',
    display_name: 'Felix',
    age: 27,
    photos: [
      'https://i.pravatar.cc/600?img=32',
      'https://i.pravatar.cc/600?img=33',
    ],
    primary_photo_idx: 0,
    job: 'Product Designer',
    distance_km: 1.2,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Kaffee, Museen, Abendessen ohne Smalltalk.',
    interest_tags: ['Design', 'Wein', 'Kino'],
    last_seen_minutes: 5,
  },
  {
    id: 'demo-m3',
    display_name: 'Jonas',
    age: 34,
    photos: ['https://i.pravatar.cc/600?img=51'],
    primary_photo_idx: 0,
    job: 'Consultant',
    city: 'Wedding',
    distance_km: 2.8,
    availability: 'today',
    verified_at: new Date().toISOString(),
    bio: 'Sport morgens, entspannt abends. Lust auf Treffen!',
    interest_tags: ['Sport', 'Fitness'],
    last_seen_minutes: 12,
  },
  {
    id: 'demo-m4',
    display_name: 'Noah',
    age: 29,
    photos: [
      demoVideoUri(DEMO_VIDEO_FLOWER),
      'https://i.pravatar.cc/600?img=22',
      'https://i.pravatar.cc/600?img=68',
    ],
    primary_photo_idx: 0,
    job: 'Fotograf',
    city: 'Kreuzberg',
    distance_km: 0.8,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Licht, Städte, ehrliche Gespräche — swipe zu meinem Clip.',
    interest_tags: ['Fotografie', 'Reisen'],
    last_seen_minutes: 8,
  },
  {
    id: 'demo-m5',
    display_name: 'Tim',
    age: 26,
    photos: ['https://i.pravatar.cc/600?img=20'],
    primary_photo_idx: 0,
    job: 'Developer',
    distance_km: 1.5,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Tech by day, Weinbars by night.',
    interest_tags: ['Gaming', 'Musik', 'Wein'],
    last_seen_minutes: 3,
  },
  {
    id: 'demo-m6',
    display_name: 'Lukas',
    age: 28,
    photos: ['https://i.pravatar.cc/600?img=15'],
    primary_photo_idx: 0,
    job: 'Marketing',
    distance_km: 0.5,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Spontan, direkt, ohne Spielchen.',
    interest_tags: ['Reisen', 'Wein'],
    last_seen_minutes: 14,
  },
  {
    id: 'demo-m7',
    display_name: 'Ben',
    age: 32,
    photos: ['https://i.pravatar.cc/600?img=25'],
    primary_photo_idx: 0,
    job: 'Arzt',
    distance_km: 1.8,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Nachtschicht, tagsüber frei.',
    interest_tags: ['Sport', 'Kochen'],
    last_seen_minutes: 2,
  },
  {
    id: 'demo-m8',
    display_name: 'Elias',
    age: 27,
    photos: ['https://i.pravatar.cc/600?img=47'],
    primary_photo_idx: 0,
    job: 'Barista',
    distance_km: 2.1,
    availability: 'today',
    verified_at: new Date().toISOString(),
    bio: 'Kaffee und gute Gespräche.',
    interest_tags: ['Kaffee', 'Musik'],
    last_seen_minutes: 45,
  },
  {
    id: 'demo-m9',
    display_name: 'Moritz',
    age: 30,
    photos: ['https://i.pravatar.cc/600?img=58'],
    primary_photo_idx: 0,
    job: 'Ingenieur',
    distance_km: 3.2,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Klettern, Craft Beer, ehrlich.',
    interest_tags: ['Sport', 'Reisen'],
    last_seen_minutes: 6,
  },
  {
    id: 'demo-m10',
    display_name: 'David',
    pseudonym: 'David_M',
    age: 29,
    photos: [
      'https://i.pravatar.cc/600?img=61',
      'https://i.pravatar.cc/600?img=63',
      'https://i.pravatar.cc/600?img=64',
      demoVideoUri(DEMO_VIDEO_BBB),
    ],
    primary_photo_idx: 0,
    job: 'Journalist',
    city: 'Mitte',
    distance_km: 0.9,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Ich schreibe über Nachtleben und Menschen, die keine Angst vor Offenheit haben. Berlin ist laut — ich suche Momente, die leise und echt sind. Wenn du neugierig bist, lass uns reden, bevor die Stadt uns wieder einsaugt. Abends gerne in kleinen Bars, ohne Show. Kein Stress, nur ehrliche Gespräche heute.',
    interest_tags: ['Kultur', 'Wein'],
    last_seen_minutes: 1,
  },
  {
    id: 'demo-m11',
    display_name: 'Finn',
    age: 25,
    photos: ['https://i.pravatar.cc/600?img=67'],
    primary_photo_idx: 0,
    job: 'Student',
    distance_km: 4.5,
    availability: 'today',
    verified_at: new Date().toISOString(),
    bio: 'Neugierig, offen, heute Abend Zeit.',
    interest_tags: ['Kino', 'Gaming'],
    last_seen_minutes: 90,
  },
  {
    id: 'demo-m12',
    display_name: 'Tom',
    age: 33,
    photos: ['https://i.pravatar.cc/600?img=11'],
    primary_photo_idx: 0,
    job: 'Gründer',
    distance_km: 2.4,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Busy days, clear nights.',
    interest_tags: ['Tech', 'Fitness'],
    last_seen_minutes: 4,
  },
  {
    id: 'demo-m13',
    display_name: 'Rafael',
    age: 31,
    photos: [
      demoVideoUri(DEMO_VIDEO_BBB),
      'https://i.pravatar.cc/600?img=52',
      'https://i.pravatar.cc/600?img=53',
    ],
    primary_photo_idx: 0,
    job: 'DJ',
    city: 'Friedrichshain',
    distance_km: 3.4,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Beats nach Mitternacht — swipe zu meinem Clip.',
    interest_tags: ['Musik', 'Kino'],
    last_seen_minutes: 7,
  },
  {
    id: 'demo-m14',
    display_name: 'Stefan',
    age: 35,
    photos: [
      'https://i.pravatar.cc/600?img=27',
      'https://i.pravatar.cc/600?img=28',
      'https://i.pravatar.cc/600?img=29',
    ],
    primary_photo_idx: 0,
    job: 'Koch',
    city: 'Kreuzberg',
    distance_km: 2.7,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Tagsüber Küche, abends Lust auf ehrliche Gespräche und gutes Essen.',
    interest_tags: ['Kochen', 'Wein', 'Reisen'],
    last_seen_minutes: 11,
  },
  {
    id: 'demo-m15',
    display_name: 'Philipp',
    age: 34,
    photos: ['https://i.pravatar.cc/600?img=30', 'https://i.pravatar.cc/600?img=31'],
    primary_photo_idx: 0,
    job: 'Anwalt',
    city: 'Mitte',
    distance_km: 1.1,
    availability: 'today',
    verified_at: new Date().toISOString(),
    bio: 'Strukturiert im Job, spontan danach.',
    interest_tags: ['Reisen', 'Kunst'],
    last_seen_minutes: 20,
  },
  {
    id: 'demo-m16',
    display_name: 'Henri',
    age: 26,
    photos: [
      'https://i.pravatar.cc/600?img=40',
      demoVideoUri(DEMO_VIDEO_FLOWER),
      'https://i.pravatar.cc/600?img=41',
    ],
    primary_photo_idx: 0,
    job: 'Architekt',
    city: 'Prenzlauer Berg',
    distance_km: 2.5,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Form follows feeling — auch im Profil.',
    interest_tags: ['Architektur', 'Fotografie'],
    last_seen_minutes: 9,
  },
  {
    id: 'demo-m17',
    display_name: 'Alex',
    age: 29,
    photos: ['https://i.pravatar.cc/600?img=44'],
    primary_photo_idx: 0,
    job: 'Personal Trainer',
    city: 'Neukölln',
    distance_km: 3.3,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Morgens Studio, abends offen für Pläne.',
    interest_tags: ['Fitness', 'Sport'],
    last_seen_minutes: 5,
  },
  {
    id: 'demo-m18',
    display_name: 'Chris',
    age: 28,
    photos: [
      demoVideoUri(DEMO_VIDEO_BBB),
      'https://i.pravatar.cc/600?img=55',
      'https://i.pravatar.cc/600?img=56',
    ],
    primary_photo_idx: 0,
    job: 'Filmproduzent',
    city: 'Neukölln',
    distance_km: 3.0,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Kurzclips statt langer Stories.',
    interest_tags: ['Kino', 'Fotografie'],
    last_seen_minutes: 3,
  },
  {
    id: 'demo-m19',
    display_name: 'Daniel',
    age: 26,
    photos: [
      'https://i.pravatar.cc/600?img=57',
      'https://i.pravatar.cc/600?img=58',
      'https://i.pravatar.cc/600?img=59',
    ],
    primary_photo_idx: 0,
    job: 'UX Researcher',
    city: 'Charlottenburg',
    distance_km: 4.8,
    availability: 'today',
    verified_at: new Date().toISOString(),
    bio: 'Ich höre gerne zu — und stelle die richtigen Fragen.',
    interest_tags: ['Design', 'Lesen'],
    last_seen_minutes: 35,
  },
  {
    id: 'demo-m20',
    display_name: 'Oskar',
    age: 32,
    photos: ['https://i.pravatar.cc/600?img=65', 'https://i.pravatar.cc/600?img=66'],
    primary_photo_idx: 0,
    job: 'Winzer',
    city: 'Schöneberg',
    distance_km: 4.2,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Guter Wein, späte Abende, ehrliche Gespräche ohne Perfektionsdruck.',
    interest_tags: ['Wein', 'Reisen', 'Kochen'],
    last_seen_minutes: 6,
  },
  {
    id: 'demo-m-far',
    display_name: 'Paul',
    age: 30,
    photos: ['https://i.pravatar.cc/600?img=60'],
    primary_photo_idx: 0,
    job: 'Anwalt',
    distance_km: 12,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Außerhalb deines Radius.',
    interest_tags: ['Reisen'],
    last_seen_minutes: 1,
  },
  {
    id: 'demo-m-offline',
    display_name: 'Max',
    age: 28,
    photos: ['https://i.pravatar.cc/600?img=70'],
    primary_photo_idx: 0,
    job: 'Musiker',
    distance_km: 2,
    availability: 'off',
    verified_at: new Date().toISOString(),
    bio: 'Pause — erscheint nicht in der Auswahl.',
    interest_tags: ['Musik'],
    last_seen_minutes: 400,
  },
];

export const DEMO_MALES: SchaufensterProfile[] = DEMO_MALE_ROWS.map(rowToDemoMale);

export const DEMO_USER_ID = 'demo-female-user';
export const DEMO_MALE_USER_ID = 'demo-male-user';

/** Frauenprofil für Partner-Ansicht (Mann im Chat) */
export function getDemoFemalePartnerProfile(): SchaufensterProfile {
  return rowToDemoMale({
    id: DEMO_USER_ID,
    pseudonym: 'Anna_M',
    display_name: 'Anna',
    age: 26,
    photos: [
      'https://i.pravatar.cc/600?img=5',
      'https://i.pravatar.cc/600?img=9',
      'https://i.pravatar.cc/600?img=10',
    ],
    primary_photo_idx: 0,
    job: 'Design',
    distance_km: 0,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Kaffee, gute Gespräche, spontane Pläne am Wochenende.',
    interest_tags: ['Kino', 'Wein', 'Reisen', 'Kochen'],
    last_seen_minutes: 2,
  });
}

export const DEMO_FEMALE_BASE: Partial<UserProfile> = {
  phone: '+4915123456789',
  gender: 'female',
  birth_date: '1998-04-12',
  verification_status: 'approved',
  account_status: 'active',
  rejection_reason: null,
  pseudonym: 'Anna_M',
  display_name: 'Anna',
  handle: '@anna',
  photos: [
    'https://i.pravatar.cc/600?img=5',
    'https://i.pravatar.cc/600?img=9',
    'https://i.pravatar.cc/600?img=10',
  ],
  primary_photo_idx: 0,
  job: 'Design',
  bio: 'Kaffee, gute Gespräche, spontane Pläne am Wochenende.',
  interest_tags: ['Kino', 'Wein', 'Reisen', 'Kochen'],
  city: 'Berlin',
  location_mode: 'fixed',
  availability: 'now',
  latitude: 52.520008,
  longitude: 13.404954,
  search_radius_km: 5,
  picks_count: 12,
  dates_count: 3,
  profile_views_today: 0,
};

export const DEMO_MALE_BASE: Partial<UserProfile> = {
  phone: '+4915998765432',
  gender: 'male',
  birth_date: '1993-08-20',
  verification_status: 'approved',
  account_status: 'active',
  rejection_reason: null,
  pseudonym: 'Markus_M',
  display_name: 'Markus',
  handle: '@markus',
  photos: [
    'https://i.pravatar.cc/600?img=32',
    'https://i.pravatar.cc/600?img=12',
  ],
  primary_photo_idx: 0,
  job: 'Architekt',
  bio: 'Isar, gutes Essen, direkte Gespräche.',
  interest_tags: ['Architektur', 'Sport', 'Reisen'],
  city: 'München',
  location_mode: 'fixed',
  availability: 'now',
  latitude: 48.14,
  longitude: 11.58,
  search_radius_km: 5,
  picks_count: 0,
  dates_count: 0,
  profile_views_today: 142,
};

const MATCH_KEY = 'fling_demo_match';
const MESSAGES_KEY = 'fling_demo_messages';
const BUSY_MALES_KEY = 'fling_demo_busy_males';
const BLOCKS_KEY = 'fling_demo_blocks';
const REPORTS_KEY = 'fling_demo_reports';

export async function getDemoBlockedIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(BLOCKS_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export async function addDemoBlock(blockedId: string) {
  const ids = await getDemoBlockedIds();
  ids.add(blockedId);
  await AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify([...ids]));
}

export async function addDemoReport(reportedId: string, reason: string) {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  const list: { reportedId: string; reason: string; at: string }[] = raw
    ? JSON.parse(raw)
    : [];
  list.push({ reportedId, reason, at: new Date().toISOString() });
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(list));
}

/** Demo: Kandidaten im Radius (Filter/Sort/Limit in lib/auswahl.ts) */
export function getDemoSchaufenster(
  _filter: AvailabilityFilter,
  radiusKm: number,
): SchaufensterProfile[] {
  return DEMO_MALES.filter((m) => m.distance_km <= radiusKm).map(
    toPublicSchaufensterProfile,
  );
}

/** Volles Profil inkl. Name/Beruf/Alter (Pick-Chat) */
export function getDemoMaleMatchProfile(id: string): SchaufensterProfile | null {
  const m = DEMO_MALES.find((x) => x.id === id);
  return m ? toMatchPartnerProfile(m) : null;
}

export function getDemoProfile(id: string): SchaufensterProfile | null {
  const m = DEMO_MALES.find((x) => x.id === id);
  return m ? toPublicSchaufensterProfile(m) : null;
}

/** Nur der aktive Demo-Match zählt — alte Busy-Listen aus Tests nicht dauerhaft behalten. */
export async function getDemoBusyMaleIds(): Promise<Set<string>> {
  const match = await getDemoMatch();
  if (!match) {
    await AsyncStorage.removeItem(BUSY_MALES_KEY);
    return new Set();
  }
  return new Set([match.male_id]);
}

export async function setDemoMaleBusy(maleId: string) {
  await AsyncStorage.setItem(BUSY_MALES_KEY, JSON.stringify([maleId]));
}

/** Demo-Match: Partner-Profile immer an male_id koppeln (verhindert falsche Fotos nach Pick-Abbruch). */
function hydrateDemoMatchPartners(match: Match): Match {
  const maleSeed =
    DEMO_MALES.find((m) => m.id === match.male_id) ?? DEMO_MALES[0];
  const savedName = match.male_profile?.display_name?.trim();
  return {
    ...match,
    male_profile: toMatchPartnerProfile({
      ...maleSeed,
      display_name:
        savedName && savedName !== 'Profil' ? savedName : maleSeed.display_name,
    }),
    female_profile:
      match.female_profile ??
      toMatchPartnerProfile(getDemoFemalePartnerProfile()),
    female_city: match.female_city ?? 'München',
    female_display_name: match.female_display_name ?? 'Anna',
  };
}

export async function getDemoMatch(): Promise<Match | null> {
  const raw = await AsyncStorage.getItem(MATCH_KEY);
  if (!raw) return null;
  let match = JSON.parse(raw) as Match;
  if (new Date(match.expires_at) < new Date()) {
    await AsyncStorage.removeItem(MATCH_KEY);
    await AsyncStorage.removeItem(MESSAGES_KEY);
    return null;
  }
  const hydrated = hydrateDemoMatchPartners(match);
  const stale =
    !match.male_profile ||
    match.male_profile.id !== match.male_id ||
    !match.male_profile.photos?.length ||
    !match.female_profile;
  if (stale) {
    await saveDemoMatch(hydrated);
  }
  return hydrated;
}

export async function saveDemoMatch(match: Match) {
  await AsyncStorage.setItem(MATCH_KEY, JSON.stringify(match));
  await setDemoMaleBusy(match.male_id);
}

export async function clearDemoMatch() {
  await AsyncStorage.removeItem(MATCH_KEY);
  await AsyncStorage.removeItem(MESSAGES_KEY);
}

export async function createDemoMatch(
  femaleId: string,
  male: SchaufensterProfile,
): Promise<Match> {
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  const match: Match = {
    id: `demo-match-${Date.now()}`,
    female_id: femaleId,
    male_id: male.id,
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: expires.toISOString(),
    male_profile: toMatchPartnerProfile(male),
    female_profile: toMatchPartnerProfile(getDemoFemalePartnerProfile()),
    female_city: 'München',
    female_display_name: 'Anna',
  };
  await saveDemoMatch(match);
  const seed = defaultDemoChatMessages(match.id);
  await AsyncStorage.setItem(
    MESSAGES_KEY,
    JSON.stringify({ [match.id]: seed }),
  );
  return match;
}

function defaultDemoChatMessages(matchId: string): Message[] {
  const now = Date.now();
  return [
    {
      id: 'demo-msg-1',
      match_id: matchId,
      sender_id: 'demo-m1',
      body: 'Schön, dass du gepickt hast.',
      created_at: new Date(now - 3_600_000).toISOString(),
      deleted_at: null,
      is_female: false,
    },
    {
      id: 'demo-msg-2',
      match_id: matchId,
      sender_id: 'demo-m1',
      body: 'Lust auf ein ruhiges Café?',
      created_at: new Date(now - 3_500_000).toISOString(),
      deleted_at: null,
      is_female: false,
    },
    {
      id: 'demo-msg-3',
      match_id: matchId,
      sender_id: 'demo-m1',
      body: 'Wann passt’s dir?',
      created_at: new Date(now - 120_000).toISOString(),
      deleted_at: null,
      is_female: false,
    },
    {
      id: 'demo-msg-4',
      match_id: matchId,
      sender_id: DEMO_USER_ID,
      body: 'Café an der Isar, 18 Uhr?',
      created_at: new Date(now - 60_000).toISOString(),
      deleted_at: null,
      is_female: true,
    },
  ];
}

export async function getDemoMessages(matchId: string): Promise<Message[]> {
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  if (!raw) return defaultDemoChatMessages(matchId);
  const all = JSON.parse(raw) as Record<string, Message[]>;
  const list = all[matchId] ?? [];
  return list.length > 0 ? list : defaultDemoChatMessages(matchId);
}

export async function addDemoMessage(
  matchId: string,
  senderId: string,
  body: string,
  isFemale: boolean,
  extra?: Partial<
    Pick<
      Message,
      'message_type' | 'media_url' | 'media_duration_ms' | 'view_once' | 'viewed_at'
    >
  >,
): Promise<Message> {
  const msg: Message = {
    id: `msg-${Date.now()}`,
    match_id: matchId,
    sender_id: senderId,
    body,
    created_at: new Date().toISOString(),
    deleted_at: null,
    is_female: isFemale,
    message_type: extra?.message_type ?? 'text',
    media_url: extra?.media_url ?? null,
    media_duration_ms: extra?.media_duration_ms ?? null,
    view_once: extra?.view_once ?? false,
    viewed_at: extra?.viewed_at ?? null,
  };
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  const all: Record<string, Message[]> = raw ? JSON.parse(raw) : {};
  all[matchId] = [...(all[matchId] ?? []), msg];
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  return msg;
}

export async function markDemoMessageViewed(messageId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  if (!raw) return;
  const all = JSON.parse(raw) as Record<string, Message[]>;
  let changed = false;
  for (const matchId of Object.keys(all)) {
    all[matchId] = all[matchId].map((m) => {
      if (m.id !== messageId) return m;
      changed = true;
      return { ...m, viewed_at: new Date().toISOString() };
    });
  }
  if (changed) await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
}

export const DEMO_STATS = {
  female_picks: 12,
  female_dates: 3,
  male_views: 142,
  nearby_active: 5,
};

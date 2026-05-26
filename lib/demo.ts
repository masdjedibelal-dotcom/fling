import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AvailabilityFilter,
  Match,
  Message,
  SchaufensterProfile,
  UserProfile,
} from './types';

/** 5 Männer im Schaufenster (Demo) */
export const DEMO_MALES: SchaufensterProfile[] = [
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
    distance_km: 2.8,
    availability: 'today',
    verified_at: new Date().toISOString(),
    bio: 'Sport morgens, entspannt abends.',
    interest_tags: ['Sport', 'Fitness'],
    last_seen_minutes: 12,
  },
  {
    id: 'demo-m4',
    display_name: 'Noah',
    age: 29,
    photos: [
      'https://i.pravatar.cc/600?img=22',
      'https://i.pravatar.cc/600?img=68',
    ],
    primary_photo_idx: 0,
    job: 'Fotograf',
    distance_km: 0.8,
    availability: 'now',
    verified_at: new Date().toISOString(),
    bio: 'Licht, Städte, ehrliche Gespräche.',
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

export const DEMO_USER_ID = 'demo-female-user';
export const DEMO_MALE_USER_ID = 'demo-male-user';

/** Frauenprofil für Partner-Ansicht (Mann im Chat) */
export function getDemoFemalePartnerProfile(): SchaufensterProfile {
  return {
    id: DEMO_USER_ID,
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
  };
}

export const DEMO_FEMALE_BASE: Partial<UserProfile> = {
  phone: '+4915123456789',
  gender: 'female',
  birth_date: '1998-04-12',
  verification_status: 'approved',
  account_status: 'active',
  rejection_reason: null,
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
  city: 'München',
  location_mode: 'fixed',
  availability: 'now',
  latitude: 48.137,
  longitude: 11.575,
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

/** Demo: Kandidaten im Radius (Filter/Sort/Limit in lib/auswahl.ts) */
export function getDemoSchaufenster(
  _filter: AvailabilityFilter,
  radiusKm: number,
): SchaufensterProfile[] {
  return DEMO_MALES.filter((m) => m.distance_km <= radiusKm);
}

export function getDemoProfile(id: string): SchaufensterProfile | null {
  return DEMO_MALES.find((m) => m.id === id) ?? null;
}

export async function getDemoBusyMaleIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(BUSY_MALES_KEY);
  return new Set(raw ? (JSON.parse(raw) as string[]) : []);
}

export async function setDemoMaleBusy(maleId: string) {
  const busy = await getDemoBusyMaleIds();
  busy.add(maleId);
  await AsyncStorage.setItem(BUSY_MALES_KEY, JSON.stringify([...busy]));
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
  if (!match.female_profile || !match.male_profile) {
    const male =
      match.male_profile ??
      DEMO_MALES.find((m) => m.id === match.male_id) ??
      DEMO_MALES[0];
    match = {
      ...match,
      male_profile: male,
      female_profile: match.female_profile ?? getDemoFemalePartnerProfile(),
      female_city: match.female_city ?? 'München',
      female_display_name: match.female_display_name ?? 'Anna',
    };
    await saveDemoMatch(match);
  }
  return match;
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
    male_profile: male,
    female_profile: getDemoFemalePartnerProfile(),
    female_city: 'München',
    female_display_name: 'Anna',
  };
  await saveDemoMatch(match);
  return match;
}

export async function getDemoMessages(matchId: string): Promise<Message[]> {
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  if (!raw) return [];
  const all = JSON.parse(raw) as Record<string, Message[]>;
  return all[matchId] ?? [];
}

export async function addDemoMessage(
  matchId: string,
  senderId: string,
  body: string,
  isFemale: boolean,
): Promise<Message> {
  const msg: Message = {
    id: `msg-${Date.now()}`,
    match_id: matchId,
    sender_id: senderId,
    body,
    created_at: new Date().toISOString(),
    deleted_at: null,
    is_female: isFemale,
  };
  const raw = await AsyncStorage.getItem(MESSAGES_KEY);
  const all: Record<string, Message[]> = raw ? JSON.parse(raw) : {};
  all[matchId] = [...(all[matchId] ?? []), msg];
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  return msg;
}

export const DEMO_STATS = {
  female_picks: 12,
  female_dates: 3,
  male_views: 142,
  nearby_active: 5,
};

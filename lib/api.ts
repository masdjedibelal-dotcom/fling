import { supabase, isSupabaseConfigured } from './supabase';
import {
  createDemoMatch,
  getDemoMatch,
  clearDemoMatch,
  getDemoMessages,
  addDemoMessage,
  markDemoMessageViewed,
  getDemoSchaufenster,
  getDemoProfile,
  getDemoBusyMaleIds,
  getDemoBlockedIds,
  addDemoBlock,
  addDemoReport,
  getDemoFemalePartnerProfile,
  getDemoMaleMatchProfile,
} from './demo';
import type {
  Availability,
  AvailabilityFilter,
  Message,
  SchaufensterProfile,
  UserProfile,
  AppConfig,
  NotificationPrefs,
} from './types';
import { DEFAULT_NOTIFICATION_PREFS } from './types';
import { DEFAULT_RADIUS_KM, MATCH_DURATION_HOURS } from './constants';
import {
  toPublicSchaufensterProfile,
  toMatchPartnerProfile,
} from './schaufensterProfile';
import {
  shouldFallbackToDemoSchaufenster,
  shouldUseDemoSchaufensterForSession,
} from './demoMode';
import type { Match } from './types';

const DEFAULT_CONFIG: AppConfig = {
  match_duration_hours: MATCH_DURATION_HOURS,
  cooldown_hours: 24,
  max_photos: 5,
  max_message_length: 160,
  max_radius_km: 50,
  default_radius_km: DEFAULT_RADIUS_KM,
  maintenance_mode: false,
  new_registrations: true,
  min_version: '1.0.0',
};

export async function fetchAppConfig(): Promise<AppConfig> {
  if (!isSupabaseConfigured) return DEFAULT_CONFIG;
  const { data } = await supabase.from('app_config').select('key, value');
  if (!data?.length) return DEFAULT_CONFIG;
  const cfg = { ...DEFAULT_CONFIG };
  for (const row of data) {
    const v = row.value;
    const key = row.key as keyof AppConfig;
    if (key in cfg) {
      (cfg as Record<string, unknown>)[key] =
        typeof v === 'string' ? JSON.parse(v) : v;
    }
  }
  return cfg;
}

/** Match-RPC → Chat-Felder (Name, Beruf, Alter) */
export function normalizeMatch(raw: Match | null): Match | null {
  if (!raw) return null;
  return {
    ...raw,
    male_profile: raw.male_profile
      ? toMatchPartnerProfile(raw.male_profile)
      : undefined,
    female_profile: raw.female_profile
      ? toMatchPartnerProfile(raw.female_profile)
      : undefined,
    female_display_name:
      raw.female_display_name?.trim() ||
      raw.female_profile?.display_name?.trim() ||
      'Profil',
  };
}

async function mergeDemoSchaufenster(
  profiles: SchaufensterProfile[],
  filter: AvailabilityFilter,
  radiusKm: number,
): Promise<SchaufensterProfile[]> {
  const mergeExplicit =
    process.env.EXPO_PUBLIC_DEMO_MOCKS === 'true' ||
    process.env.EXPO_PUBLIC_DEMO_MOCKS === '1';
  if (!mergeExplicit) return profiles;
  const busy = await getDemoBusyMaleIds();
  const blocked = await getDemoBlockedIds();
  const demo = getDemoSchaufenster(filter, radiusKm)
    .map(toPublicSchaufensterProfile)
    .filter((m) => !busy.has(m.id) && !blocked.has(m.id));
  const ids = new Set(profiles.map((p) => p.id));
  return [...profiles, ...demo.filter((d) => !ids.has(d.id))];
}

async function demoSchaufensterList(
  filter: AvailabilityFilter,
  radiusKm: number,
): Promise<SchaufensterProfile[]> {
  const busy = await getDemoBusyMaleIds();
  const blocked = await getDemoBlockedIds();
  return getDemoSchaufenster(filter, radiusKm)
    .map(toPublicSchaufensterProfile)
    .filter((m) => !busy.has(m.id) && !blocked.has(m.id));
}

export async function fetchSchaufenster(
  radiusKm: number,
  filter: AvailabilityFilter,
  userLat?: number,
  userLng?: number,
): Promise<SchaufensterProfile[]> {
  if (!isSupabaseConfigured || shouldUseDemoSchaufensterForSession()) {
    return demoSchaufensterList(filter, radiusKm);
  }
  const { data, error } = await supabase.rpc('get_schaufenster', {
    radius_km: radiusKm,
    filter,
    user_lat: userLat ?? null,
    user_lng: userLng ?? null,
  });
  if (error) {
    if (__DEV__) {
      console.warn('[fetchSchaufenster]', error.message);
    }
    if (shouldFallbackToDemoSchaufenster()) {
      return demoSchaufensterList(filter, radiusKm);
    }
    return [];
  }
  const mapped = ((data ?? []) as SchaufensterProfile[]).map(
    toPublicSchaufensterProfile,
  );
  if (mapped.length > 0) {
    return mergeDemoSchaufenster(mapped, filter, radiusKm);
  }
  if (shouldFallbackToDemoSchaufenster()) {
    if (__DEV__) {
      console.info('[fetchSchaufenster] Supabase leer — Demo-Profile (Dev)');
    }
    return demoSchaufensterList(filter, radiusKm);
  }
  return [];
}

export async function fetchSchaufensterProfile(
  id: string,
): Promise<SchaufensterProfile | null> {
  if (!isSupabaseConfigured) {
    const demo = getDemoProfile(id);
    return demo ? toPublicSchaufensterProfile(demo) : null;
  }
  const { data, error } = await supabase.rpc('get_schaufenster_profile', {
    profile_id: id,
  });
  if (error && __DEV__) {
    console.warn('[fetchSchaufensterProfile]', error.message);
  }
  const raw = data as SchaufensterProfile | null;
  if (raw) return toPublicSchaufensterProfile(raw);
  if (shouldFallbackToDemoSchaufenster()) {
    const demo = getDemoProfile(id);
    return demo ? toPublicSchaufensterProfile(demo) : null;
  }
  return null;
}

export async function fetchPartnerProfile(
  matchId: string,
  viewerGender: 'female' | 'male',
): Promise<{ profile: SchaufensterProfile; city: string | null } | null> {
  void viewerGender;

  if (!isSupabaseConfigured) {
    const match = await getDemoMatch();
    if (!match) return null;

    if (viewerGender === 'male') {
      const profile = match.female_profile ?? getDemoFemalePartnerProfile();
      return {
        profile: toMatchPartnerProfile(profile),
        city: match.female_city ?? 'München',
      };
    }

    const male =
      match.male_profile ?? getDemoMaleMatchProfile(match.male_id);
    if (!male) return null;
    return { profile: toMatchPartnerProfile(male), city: null };
  }

  const { data, error } = await supabase.rpc('get_partner_profile', {
    p_match_id: matchId,
  });
  if (error || !data) return null;

  const row = data as { profile: SchaufensterProfile; city: string | null };
  return {
    profile: toMatchPartnerProfile(row.profile),
    city: row.city,
  };
}

export async function fetchActiveMatch(userId: string): Promise<Match | null> {
  if (!isSupabaseConfigured) return getDemoMatch();
  const { data, error } = await supabase.rpc('get_active_match', {
    user_id: userId,
  });
  if (error || !data) return getDemoMatch();
  let match = normalizeMatch(data as Match);
  if (match && !match.male_profile?.display_name) {
    const hydrated = normalizeMatch(
      (await supabase.rpc('get_active_match', { user_id: userId })).data as Match,
    );
    if (hydrated?.male_profile) match = hydrated;
  }
  return match;
}

function isDemoProfileId(id: string): boolean {
  return id.startsWith('demo-');
}

function shouldUseDemoMatch(maleId: string): boolean {
  return !isSupabaseConfigured || isDemoProfileId(maleId);
}

function shouldFallbackCreateMatchToDemo(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('invalid api key') ||
    m.includes('jwt') ||
    m.includes('not authenticated') ||
    m.includes('permission denied')
  );
}

async function createMatchViaDemo(
  femaleId: string,
  maleId: string,
): Promise<{ match: Match | null; error: string | null }> {
  const existing = await getDemoMatch();
  if (existing) {
    if (existing.male_id === maleId) {
      return { match: existing, error: null };
    }
    return { match: null, error: 'Du hast bereits einen aktiven Pick.' };
  }

  const male = getDemoProfile(maleId);
  if (!male) return { match: null, error: 'Profil nicht gefunden' };
  const match = await createDemoMatch(femaleId, male);
  return { match, error: null };
}

export async function replaceMatch(
  femaleId: string,
  maleId: string,
  existingMatchId: string,
): Promise<{ match: Match | null; error: string | null }> {
  const { error: cancelError } = await cancelMatch(existingMatchId);
  if (cancelError) return { match: null, error: cancelError };
  return createMatch(femaleId, maleId);
}

export async function createMatch(
  femaleId: string,
  maleId: string,
): Promise<{ match: Match | null; error: string | null }> {
  if (shouldUseDemoMatch(maleId)) {
    return createMatchViaDemo(femaleId, maleId);
  }

  const { data, error } = await supabase.rpc('create_match', { male_id: maleId });
  if (error) {
    if (__DEV__ && shouldFallbackCreateMatchToDemo(error.message)) {
      return createMatchViaDemo(femaleId, maleId);
    }
    return { match: null, error: error.message };
  }
  let match = normalizeMatch(data as Match);
  if (match && !match.male_profile?.display_name) {
    match = (await fetchActiveMatch(femaleId)) ?? match;
  }
  return { match, error: null };
}

export async function cancelMatch(matchId: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    await clearDemoMatch();
    return { error: null };
  }
  const { error } = await supabase.rpc('cancel_match', { match_id: matchId });
  return { error: error?.message ?? null };
}

export async function fetchMessages(matchId: string): Promise<Message[]> {
  if (!isSupabaseConfigured) return getDemoMessages(matchId);
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) return getDemoMessages(matchId);
  return (data ?? []) as Message[];
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  body: string,
  isFemale: boolean,
): Promise<{ message: Message | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    const message = await addDemoMessage(matchId, senderId, body, isFemale);
    return { message, error: null };
  }
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, body })
    .select()
    .single();
  if (error) return { message: null, error: error.message };
  return {
    message: { ...(data as Message), is_female: isFemale },
    error: null,
  };
}

export type SendMediaPayload = {
  message_type: 'image' | 'voice';
  media_url: string;
  body?: string;
  media_duration_ms?: number;
  view_once?: boolean;
};

export async function sendMediaMessage(
  matchId: string,
  senderId: string,
  isFemale: boolean,
  payload: SendMediaPayload,
): Promise<{ message: Message | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    const message = await addDemoMessage(matchId, senderId, payload.body ?? '', isFemale, {
      message_type: payload.message_type,
      media_url: payload.media_url,
      media_duration_ms: payload.media_duration_ms,
      view_once: payload.view_once ?? payload.message_type === 'image',
    });
    return { message, error: null };
  }
  const row = {
    match_id: matchId,
    sender_id: senderId,
    body: payload.body ?? '',
    message_type: payload.message_type,
    media_url: payload.media_url,
    media_duration_ms: payload.media_duration_ms ?? null,
    view_once: payload.view_once ?? payload.message_type === 'image',
  };
  const { data, error } = await supabase.from('messages').insert(row).select().single();
  if (error) return { message: null, error: error.message };
  return {
    message: { ...(data as Message), is_female: isFemale },
    error: null,
  };
}

export async function markMessageViewed(
  messageId: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    await markDemoMessageViewed(messageId);
    return { error: null };
  }
  const { error } = await supabase
    .from('messages')
    .update({ viewed_at: new Date().toISOString() })
    .eq('id', messageId);
  return { error: error?.message ?? null };
}

export async function submitReport(
  _reporterId: string,
  reportedId: string,
  reason: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    await addDemoReport(reportedId, reason);
    return { error: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Bitte erneut anmelden.' };
  const { error } = await supabase.rpc('submit_report', {
    reported_id: reportedId,
    reason,
  });
  return { error: error?.message ?? null };
}

export async function blockUser(
  _blockerId: string,
  blockedId: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    await addDemoBlock(blockedId);
    return { error: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Bitte erneut anmelden.' };
  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: user.id, blocked_id: blockedId });
  if (error?.code === '23505') return { error: null };
  return { error: error?.message ?? null };
}

export async function updateUserProfile(
  userId: string,
  patch: Partial<UserProfile>,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase
    .from('users')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { error: error?.message ?? null };
}

export async function updateAvailability(
  userId: string,
  availability: Availability,
): Promise<{ error: string | null }> {
  return updateUserProfile(userId, { availability });
}

export async function deleteOwnAccount(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.rpc('delete_own_account');
  return { error: error?.message ?? null };
}

export function enrichProfile(p: Partial<UserProfile> | null): UserProfile | null {
  if (!p?.id) return null;
  return {
    pseudonym: p.pseudonym ?? (p.gender === 'female' ? 'Anna_M' : 'Markus_M'),
    display_name: p.display_name ?? (p.gender === 'female' ? 'Anna' : 'Markus'),
    handle: p.handle ?? `@${p.gender === 'female' ? 'anna' : 'markus'}`,
    photos: p.photos ?? ['https://i.pravatar.cc/400?img=5'],
    primary_photo_idx: p.primary_photo_idx ?? 0,
    job: p.job ?? (p.gender === 'male' ? 'Architekt' : null),
    bio: p.bio ?? '',
    interest_tags: p.interest_tags ?? [],
    city: p.city ?? (p.gender === 'female' ? 'Berlin' : 'Berlin'),
    location_mode: p.location_mode ?? 'fixed',
    availability: p.availability ?? 'now',
    latitude: p.latitude ?? (p.gender === 'female' ? 52.520008 : null),
    longitude: p.longitude ?? (p.gender === 'female' ? 13.404954 : null),
    search_radius_km: p.search_radius_km ?? DEFAULT_RADIUS_KM,
    profile_views_today: p.profile_views_today ?? 142,
    picks_count: p.picks_count ?? 12,
    dates_count: p.dates_count ?? 3,
    push_token: p.push_token ?? null,
    suspended_until: p.suspended_until ?? null,
    notification_prefs: p.notification_prefs ?? DEFAULT_NOTIFICATION_PREFS,
    ...p,
  } as UserProfile;
}

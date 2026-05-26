import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { supabase, isSupabaseConfigured } from './supabase';
import type { SafePickRating, SafePickSession } from './types';

const DEMO_SAFE_PICKS_KEY = 'fling_demo_safe_picks';
const NOTIFICATION_PREFIX = 'safe-pick-';

export async function fetchSafePickForMatch(
  matchId: string,
  userId: string,
): Promise<SafePickSession | null> {
  if (!isSupabaseConfigured) {
    return getDemoSafePickForMatch(matchId);
  }
  const { data, error } = await supabase.rpc('get_safe_pick_for_match', {
    p_match_id: matchId,
  });
  if (error) return getDemoSafePickForMatch(matchId);
  return data ? (data as SafePickSession) : null;
}

export async function createSafePick(input: {
  matchId: string;
  userId: string;
  meetAt: Date;
  areaText: string;
  contextNote?: string;
  checkInDelayMinutes: number;
}): Promise<{ session: SafePickSession | null; error: string | null }> {
  const meetAtIso = input.meetAt.toISOString();
  const area = input.areaText.trim();
  const context = input.contextNote?.trim() || null;

  if (!area) return { session: null, error: 'Bitte Ort angeben' };

  if (!isSupabaseConfigured) {
    const existing = await getDemoSafePickForMatch(input.matchId);
    if (existing?.status === 'active') {
      return { session: null, error: 'Safe Pick ist bereits aktiv' };
    }
    const delay = input.checkInDelayMinutes;
    const checkInAt = new Date(input.meetAt.getTime() + delay * 60_000);
    const session: SafePickSession = {
      id: `safe-${Date.now()}`,
      match_id: input.matchId,
      user_id: input.userId,
      meet_at: meetAtIso,
      area_text: area,
      context_note: context,
      check_in_at: checkInAt.toISOString(),
      status: 'active',
      follow_up_rating: null,
      follow_up_note: null,
      follow_up_at: null,
      created_at: new Date().toISOString(),
    };
    await saveDemoSafePick(session);
    await scheduleSafePickCheckIn(session);
    return { session, error: null };
  }

  const { data, error } = await supabase.rpc('create_safe_pick', {
    p_match_id: input.matchId,
    p_meet_at: meetAtIso,
    p_area_text: area,
    p_context_note: context,
    p_check_in_delay_minutes: input.checkInDelayMinutes,
  });
  if (error) return { session: null, error: error.message };
  const session = data as SafePickSession;
  await scheduleSafePickCheckIn(session);
  return { session, error: null };
}

export async function submitSafePickFollowUp(
  sessionId: string,
  rating: SafePickRating,
  note: string,
): Promise<{ session: SafePickSession | null; error: string | null }> {
  const trimmed = note.trim().slice(0, 200);

  if (!isSupabaseConfigured) {
    const all = await getAllDemoSafePicks();
    const idx = all.findIndex((s) => s.id === sessionId);
    if (idx < 0) return { session: null, error: 'Nicht gefunden' };
    const updated: SafePickSession = {
      ...all[idx],
      status: 'completed',
      follow_up_rating: rating,
      follow_up_note: trimmed || null,
      follow_up_at: new Date().toISOString(),
    };
    all[idx] = updated;
    await AsyncStorage.setItem(DEMO_SAFE_PICKS_KEY, JSON.stringify(all));
    await cancelSafePickNotification(sessionId);
    return { session: updated, error: null };
  }

  const { data, error } = await supabase.rpc('submit_safe_pick_followup', {
    p_session_id: sessionId,
    p_rating: rating,
    p_note: trimmed,
  });
  if (error) return { session: null, error: error.message };
  const session = data as SafePickSession;
  await cancelSafePickNotification(sessionId);
  return { session, error: null };
}

export function isSafePickCheckInDue(session: SafePickSession | null): boolean {
  if (!session || session.status !== 'active') return false;
  return new Date(session.check_in_at).getTime() <= Date.now();
}

export function formatSafePickMeetTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function getAllDemoSafePicks(): Promise<SafePickSession[]> {
  const raw = await AsyncStorage.getItem(DEMO_SAFE_PICKS_KEY);
  return raw ? (JSON.parse(raw) as SafePickSession[]) : [];
}

async function saveDemoSafePick(session: SafePickSession) {
  const all = await getAllDemoSafePicks();
  const without = all.filter((s) => s.match_id !== session.match_id);
  await AsyncStorage.setItem(
    DEMO_SAFE_PICKS_KEY,
    JSON.stringify([session, ...without]),
  );
}

export async function getDemoSafePickForMatch(
  matchId: string,
): Promise<SafePickSession | null> {
  const all = await getAllDemoSafePicks();
  return all.find((s) => s.match_id === matchId) ?? null;
}

/** Team-Ansicht (Demo / intern) */
export async function fetchAllSafePicksForTeam(): Promise<SafePickSession[]> {
  if (!isSupabaseConfigured) {
    const all = await getAllDemoSafePicks();
    return all.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  const { data, error } = await supabase.rpc('admin_list_safe_picks');
  if (error) return [];
  return (data ?? []) as SafePickSession[];
}

async function scheduleSafePickCheckIn(session: SafePickSession) {
  const at = new Date(session.check_in_at);
  if (at.getTime() <= Date.now()) return;

  try {
    await cancelSafePickNotification(session.id);
    await Notifications.scheduleNotificationAsync({
      identifier: `${NOTIFICATION_PREFIX}${session.id}`,
      content: {
        title: 'Safe Pick',
        body: 'Wie läuft’s? Kurz Bescheid geben.',
        data: { type: 'safe_pick_checkin', matchId: session.match_id },
      },
      trigger: { date: at },
    });
  } catch {
    // Push optional — Check-in erscheint auch im Chat
  }
}

async function cancelSafePickNotification(sessionId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      `${NOTIFICATION_PREFIX}${sessionId}`,
    );
  } catch {
    // ignore
  }
}

export function buildMeetAtToday(hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() < Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

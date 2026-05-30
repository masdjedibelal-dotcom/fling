import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

/** Demo-IDs und fehlende Supabase-Konfiguration → kein Realtime (vermeidet subscribe()-Fehler). */
export function canUseSupabaseRealtime(scopeId?: string | null): boolean {
  if (!isSupabaseConfigured) return false;
  if (scopeId?.startsWith('demo-')) return false;
  return true;
}

export function teardownRealtimeChannel(channel: RealtimeChannel) {
  void channel.unsubscribe();
  supabase.removeChannel(channel);
}

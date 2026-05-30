import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchActiveMatch } from '@/lib/api';
import { canUseSupabaseRealtime, teardownRealtimeChannel } from '@/lib/realtime';
import type { Match } from '@/lib/types';

export function useMatch(userId: string | null) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setMatch(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchActiveMatch(userId);
    setMatch(data);
    setLoading(false);
  }, [userId]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canUseSupabaseRealtime(userId)) return;

    const channel = supabase
      .channel(`match-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          void loadRef.current();
        },
      )
      .subscribe();

    return () => {
      teardownRealtimeChannel(channel);
    };
  }, [userId]);

  const remainingMs = match
    ? new Date(match.expires_at).getTime() - Date.now()
    : 0;

  const remainingHours = Math.max(0, Math.floor(remainingMs / 3600000));
  const remainingMinutes = Math.max(
    0,
    Math.floor((remainingMs % 3600000) / 60000),
  );
  const progress = match
    ? Math.max(0, Math.min(1, remainingMs / (24 * 3600000)))
    : 0;

  return {
    match,
    loading,
    reload: load,
    remainingMs,
    remainingHours,
    remainingMinutes,
    progress,
    isExpired: remainingMs <= 0 && match !== null,
  };
}

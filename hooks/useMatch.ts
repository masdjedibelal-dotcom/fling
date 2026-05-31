import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchActiveMatch } from '@/lib/api';
import { canUseSupabaseRealtime, teardownRealtimeChannel } from '@/lib/realtime';
import type { Match } from '@/lib/types';

export function useMatch(userId: string | null) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const load = useCallback(
    async (silent = false) => {
      if (!userId) {
        setMatch(null);
        setLoading(false);
        hasLoadedRef.current = false;
        return;
      }
      if (!silent || !hasLoadedRef.current) setLoading(true);
      const data = await fetchActiveMatch(userId);
      setMatch(data);
      setLoading(false);
      hasLoadedRef.current = true;
    },
    [userId],
  );

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    if (!canUseSupabaseRealtime(userId)) return;

    const channel = supabase
      .channel(`match-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          void loadRef.current(true);
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
    reload: () => load(true),
    remainingMs,
    remainingHours,
    remainingMinutes,
    progress,
    isExpired: remainingMs <= 0 && match !== null,
  };
}

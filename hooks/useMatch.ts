import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchActiveMatch } from '@/lib/api';
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;
    const channel = supabase
      .channel(`match-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

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

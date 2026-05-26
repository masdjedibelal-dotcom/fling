import { useCallback, useEffect, useState } from 'react';
import {
  fetchSafePickForMatch,
  isSafePickCheckInDue,
} from '@/lib/safePick';
import type { SafePickSession } from '@/lib/types';

export function useSafePick(matchId: string | null, userId: string, enabled: boolean) {
  const [session, setSession] = useState<SafePickSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkInDue, setCheckInDue] = useState(false);

  const refresh = useCallback(async () => {
    if (!matchId || !enabled) {
      setSession(null);
      setCheckInDue(false);
      return;
    }
    setLoading(true);
    const s = await fetchSafePickForMatch(matchId, userId);
    setSession(s);
    setCheckInDue(isSafePickCheckInDue(s));
    setLoading(false);
  }, [matchId, userId, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!session || session.status !== 'active') return;
    const tick = () => setCheckInDue(isSafePickCheckInDue(session));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [session]);

  return {
    session,
    loading,
    checkInDue,
    refresh,
    setSession,
    isActive: session?.status === 'active',
    isCompleted: session?.status === 'completed',
  };
}

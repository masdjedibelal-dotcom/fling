import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchSchaufenster } from '@/lib/api';
import { prepareAuswahlProfiles } from '@/lib/auswahl';
import { AUSWAHL_MAX_RADIUS_KM } from '@/lib/constants';
import { canUseSupabaseRealtime, teardownRealtimeChannel } from '@/lib/realtime';
import type { SchaufensterProfile } from '@/lib/types';

export function useSchaufenster(userLat?: number, userLng?: number) {
  const [profiles, setProfiles] = useState<SchaufensterProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const raw = await fetchSchaufenster(
      AUSWAHL_MAX_RADIUS_KM,
      'all',
      userLat,
      userLng,
    );
    setProfiles(prepareAuswahlProfiles(raw));
    setLoading(false);
  }, [userLat, userLng]);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canUseSupabaseRealtime()) return;

    const channel = supabase
      .channel('schaufenster-matches')
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
  }, []);

  const activeCount = profiles.filter((p) => p.availability === 'now').length;

  return { profiles, loading, reload: load, activeCount, totalCount: profiles.length };
}

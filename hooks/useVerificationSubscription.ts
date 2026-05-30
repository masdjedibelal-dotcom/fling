import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { canUseSupabaseRealtime, teardownRealtimeChannel } from '@/lib/realtime';
import { useAuthStore } from '@/stores/authStore';
import type { VerificationStatus } from '@/lib/types';

export function useVerificationSubscription(userId: string | null) {
  const setVerificationStatus = useAuthStore((s) => s.setVerificationStatus);
  const setRejectionReason = useAuthStore((s) => s.setRejectionReason);

  const setVerificationStatusRef = useRef(setVerificationStatus);
  const setRejectionReasonRef = useRef(setRejectionReason);
  setVerificationStatusRef.current = setVerificationStatus;
  setRejectionReasonRef.current = setRejectionReason;

  useEffect(() => {
    if (!canUseSupabaseRealtime(userId)) return;

    const channel = supabase
      .channel(`user-verification-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            verification_status: VerificationStatus;
            rejection_reason: string | null;
          };
          setVerificationStatusRef.current(row.verification_status);
          if (row.rejection_reason) {
            setRejectionReasonRef.current(row.rejection_reason as never);
          }
          if (row.verification_status === 'approved') {
            router.replace('/(auth)/verify/approved');
          } else if (row.verification_status === 'rejected') {
            router.replace('/(auth)/verify/rejected');
          }
        },
      )
      .subscribe();

    return () => {
      teardownRealtimeChannel(channel);
    };
  }, [userId]);
}

import { useEffect } from 'react';
import { router } from 'expo-router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { VerificationStatus } from '@/lib/types';

export function useVerificationSubscription(userId: string | null) {
  const setProfile = useAuthStore((s) => s.setProfile);
  const setVerificationStatus = useAuthStore((s) => s.setVerificationStatus);
  const setRejectionReason = useAuthStore((s) => s.setRejectionReason);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;

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
          setVerificationStatus(row.verification_status);
          if (row.rejection_reason) {
            setRejectionReason(row.rejection_reason as never);
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
      supabase.removeChannel(channel);
    };
  }, [userId, setProfile, setVerificationStatus, setRejectionReason]);
}

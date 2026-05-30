import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Redirect } from 'expo-router';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { fetchUserProfile } from '@/lib/auth';
import { getPostAuthRoute, useAuthStore } from '@/stores/authStore';
import { isDemoMode, ensureDemoSession } from '@/lib/demoMode';

export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const onboardingStep = useAuthStore((s) => s.onboardingStep);
  const userId = useAuthStore((s) => s.userId);
  const verificationStatus = useAuthStore((s) => s.verificationStatus);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    if (hydrated && isDemoMode) ensureDemoSession();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !isSupabaseConfigured) return;

    supabase.auth.getSession().then(async ({ data }) => {
      const sessionUserId = data.session?.user?.id;
      if (!sessionUserId) return;
      const { data: profile } = await fetchUserProfile(sessionUserId);
      setSession(sessionUserId, profile);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.id) {
        const { data: profile } = await fetchUserProfile(session.user.id);
        setSession(session.user.id, profile);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [hydrated, setSession]);

  if (!hydrated) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#E11539" />
      </Screen>
    );
  }

  if (userId && verificationStatus === 'approved') {
    return <Redirect href="/(tabs)" />;
  }

  if (userId) {
    return <Redirect href={getPostAuthRoute(useAuthStore.getState()) as never} />;
  }

  const routes: Record<string, string> = {
    age_gate: '/(auth)/age-gate',
    agb: '/(auth)/agb',
    welcome: '/(auth)/welcome',
    onboarding: '/(auth)/welcome',
    verify: '/(auth)/verify/phone',
    complete: '/(tabs)',
  };

  return <Redirect href={routes[onboardingStep] as never} />;
}

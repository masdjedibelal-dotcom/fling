import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { enrichProfile } from '@/lib/api';
import {
  DEMO_FEMALE_BASE,
  DEMO_MALE_BASE,
  DEMO_MALE_USER_ID,
  DEMO_USER_ID,
} from '@/lib/demo';
import type { Gender, UserProfile } from '@/lib/types';

/** Im Dev oder ohne Supabase: Verifikation überspringbar */
export const isDemoMode = __DEV__ || !isSupabaseConfigured;

/**
 * Mock-Schaufenster wie im Browser, wenn Supabase leer ist oder RPC fehlschlägt.
 * TestFlight: EXPO_PUBLIC_DEMO_MOCKS=true in Codemagic setzen — oder seed_demo_males.sql.
 */
export function isDemoSchaufensterFallbackEnabled(): boolean {
  return (
    __DEV__ ||
    !isSupabaseConfigured ||
    process.env.EXPO_PUBLIC_DEMO_MOCKS === 'true' ||
    process.env.EXPO_PUBLIC_DEMO_MOCKS === '1'
  );
}

export function getDemoUserProfile(gender: Gender): UserProfile {
  const now = new Date().toISOString();
  const base = gender === 'female' ? DEMO_FEMALE_BASE : DEMO_MALE_BASE;
  return enrichProfile({
    ...base,
    id: gender === 'female' ? DEMO_USER_ID : DEMO_MALE_USER_ID,
    terms_accepted_at: now,
    privacy_accepted_at: now,
    marketing_opt_in: false,
    created_at: now,
    updated_at: now,
  })!;
}

function buildDemoProfile(gender: Gender): UserProfile {
  const state = useAuthStore.getState();
  const profile = getDemoUserProfile(gender);
  if (state.birthDate) {
    return { ...profile, birth_date: state.birthDate };
  }
  return profile;
}

/** Stellt Demo-Session wieder her, wenn Tabs ohne Profil geöffnet werden */
export function ensureDemoSession(): void {
  if (!isDemoMode) return;

  const store = useAuthStore.getState();
  const gender: Gender = store.gender ?? 'female';
  const needsSession = !store.userId || !store.profile?.id;

  if (needsSession) {
    const profile = buildDemoProfile(gender);
    store.setGender(gender);
    store.setPhone(profile.phone ?? '+4915123456789');
    store.setSession(
      gender === 'female' ? DEMO_USER_ID : profile.id,
      profile,
    );
    store.setVerificationStatus('approved');
    store.advanceOnboarding('complete');
    return;
  }

  // Altes Profil ohne neue Felder (city, location_mode) auffrischen
  if (!store.profile?.city || !store.profile?.location_mode) {
    store.setProfile(buildDemoProfile(gender));
  }
}

/** Kompletter Auth-Flow überspringen → Schaufenster */
export function skipToApp(gender?: Gender) {
  const g = gender ?? useAuthStore.getState().gender ?? 'female';
  const profile = buildDemoProfile(g);
  const store = useAuthStore.getState();
  store.setGender(g);
  store.setPhone(profile.phone ?? '+4915123456789');
  store.setSession(g === 'female' ? DEMO_USER_ID : profile.id, profile);
  store.setVerificationStatus('approved');
  store.advanceOnboarding('complete');
  router.replace('/(tabs)');
}

/** Telefon bestätigt (Demo) → nächster Verify-Schritt oder App */
export async function confirmDemoPhone(skipToAppDirectly = false) {
  const store = useAuthStore.getState();
  const gender = store.gender ?? 'female';
  store.setPhone('+4915123456789');

  if (skipToAppDirectly) {
    skipToApp(gender);
    return;
  }

  const profile = buildDemoProfile(gender);
  store.setSession(DEMO_USER_ID, { ...profile, verification_status: 'phone_pending' });
  store.setVerificationStatus('phone_pending');

  if (gender === 'male') {
    router.replace('/(auth)/verify/id-scan');
  } else {
    router.replace('/(auth)/verify/selfie');
  }
}

/** Selfie / Ausweis überspringen → Pending (oder direkt App) */
export function skipVerificationSteps(goStraightToApp = true) {
  if (goStraightToApp) {
    skipToApp();
    return;
  }
  useAuthStore.getState().setVerificationStatus('pending_review');
  router.replace('/(auth)/verify/pending');
}

/** Demo: Verifikation freigeschaltet → Erfolgs-Screen mit Verified-Stamp */
export function skipToApproved(gender?: Gender) {
  const g = gender ?? useAuthStore.getState().gender ?? 'female';
  const profile = buildDemoProfile(g);
  const store = useAuthStore.getState();
  store.setGender(g);
  store.setPhone(profile.phone ?? '+4915123456789');
  store.setSession(g === 'female' ? DEMO_USER_ID : profile.id, profile);
  store.setVerificationStatus('approved');
  store.advanceOnboarding('complete');
  router.replace('/(auth)/verify/approved');
}

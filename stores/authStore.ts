import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AccountStatus,
  Gender,
  RejectionReason,
  UserProfile,
  VerificationStatus,
} from '@/lib/types';

const ONBOARDING_KEY = 'fling_onboarding';

export type OnboardingStep =
  | 'age_gate'
  | 'agb'
  | 'welcome'
  | 'onboarding'
  | 'verify'
  | 'complete';

interface AuthState {
  hydrated: boolean;
  onboardingStep: OnboardingStep;
  birthDate: string | null;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
  gender: Gender | null;
  phone: string | null;
  isReturningUser: boolean;
  userId: string | null;
  profile: UserProfile | null;
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  rejectionReason: RejectionReason | null;

  setHydrated: (v: boolean) => void;
  setBirthDate: (iso: string) => void;
  setAgreements: (terms: boolean, privacy: boolean, marketing: boolean) => void;
  setGender: (gender: Gender) => void;
  setPhone: (phone: string) => void;
  setReturningUser: (v: boolean) => void;
  setSession: (userId: string, profile?: UserProfile | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setVerificationStatus: (status: VerificationStatus) => void;
  setRejectionReason: (reason: RejectionReason | null) => void;
  advanceOnboarding: (step: OnboardingStep) => void;
  resetOnboarding: () => void;
  signOutLocal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hydrated: false,
      onboardingStep: 'age_gate',
      birthDate: null,
      termsAccepted: false,
      privacyAccepted: false,
      marketingOptIn: false,
      gender: null,
      phone: null,
      isReturningUser: false,
      userId: null,
      profile: null,
      verificationStatus: 'none',
      accountStatus: 'active',
      rejectionReason: null,

      setHydrated: (v) => set({ hydrated: v }),
      setBirthDate: (iso) => set({ birthDate: iso }),
      setAgreements: (terms, privacy, marketing) =>
        set({
          termsAccepted: terms,
          privacyAccepted: privacy,
          marketingOptIn: marketing,
        }),
      setGender: (gender) => set({ gender }),
      setPhone: (phone) => set({ phone }),
      setReturningUser: (v) => set({ isReturningUser: v }),
      setSession: (userId, profile) =>
        set({
          userId,
          profile: profile ?? null,
          verificationStatus: profile?.verification_status ?? 'none',
          accountStatus: profile?.account_status ?? 'active',
          rejectionReason: profile?.rejection_reason ?? null,
        }),
      setProfile: (profile) =>
        set({
          profile,
          verificationStatus: profile?.verification_status ?? 'none',
          accountStatus: profile?.account_status ?? 'active',
          rejectionReason: profile?.rejection_reason ?? null,
        }),
      setVerificationStatus: (status) => set({ verificationStatus: status }),
      setRejectionReason: (reason) => set({ rejectionReason: reason }),
      advanceOnboarding: (step) => set({ onboardingStep: step }),
      resetOnboarding: () =>
        set({
          onboardingStep: 'age_gate',
          birthDate: null,
          termsAccepted: false,
          privacyAccepted: false,
          marketingOptIn: false,
          gender: null,
          phone: null,
          isReturningUser: false,
        }),
      signOutLocal: () =>
        set({
          userId: null,
          profile: null,
          verificationStatus: 'none',
          accountStatus: 'active',
          rejectionReason: null,
          phone: null,
          isReturningUser: false,
        }),
    }),
    {
      name: ONBOARDING_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingStep: state.onboardingStep,
        birthDate: state.birthDate,
        termsAccepted: state.termsAccepted,
        privacyAccepted: state.privacyAccepted,
        marketingOptIn: state.marketingOptIn,
        gender: state.gender,
        phone: state.phone,
        isReturningUser: state.isReturningUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function getPostAuthRoute(state: AuthState): string {
  const { gender, verificationStatus, rejectionReason } = state;

  if (verificationStatus === 'approved') {
    return '/(tabs)';
  }
  if (verificationStatus === 'rejected' && rejectionReason) {
    return '/(auth)/verify/rejected';
  }
  if (verificationStatus === 'pending_review') {
    return '/(auth)/verify/pending';
  }
  if (gender === 'male') {
    if (verificationStatus === 'phone_pending' || verificationStatus === 'none') {
      return '/(auth)/verify/id-scan';
    }
    if (verificationStatus === 'documents_pending') {
      return '/(auth)/verify/selfie';
    }
  }
  if (gender === 'female') {
    if (
      verificationStatus === 'phone_pending' ||
      verificationStatus === 'documents_pending' ||
      verificationStatus === 'none'
    ) {
      return '/(auth)/verify/selfie';
    }
  }
  return '/(auth)/verify/phone';
}

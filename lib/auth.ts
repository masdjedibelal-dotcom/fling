import { supabase, isSupabaseConfigured } from './supabase';
import type { Gender, UserProfile } from './types';
import { enrichProfile } from './api';

export async function sendPhoneOtp(phoneE164: string) {
  if (!isSupabaseConfigured) {
    return { error: null, demo: true as const };
  }
  const { error } = await supabase.auth.signInWithOtp({ phone: phoneE164 });
  return { error, demo: false as const };
}

export async function verifyPhoneOtp(phoneE164: string, token: string) {
  if (!isSupabaseConfigured) {
    return {
      data: { user: { id: 'demo-user-id' }, session: { access_token: 'demo' } },
      error: null,
      demo: true as const,
    };
  }
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token,
    type: 'sms',
  });
  return { data, error, demo: false as const };
}

export async function upsertUserProfile(params: {
  id: string;
  gender: Gender;
  birthDate: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
}) {
  const now = new Date().toISOString();
  const row = {
    id: params.id,
    gender: params.gender,
    birth_date: params.birthDate,
    terms_accepted_at: params.termsAccepted ? now : null,
    privacy_accepted_at: params.privacyAccepted ? now : null,
    marketing_opt_in: params.marketingOptIn,
    verification_status:
      params.gender === 'female' ? 'phone_pending' : 'phone_pending',
    account_status: 'active',
    updated_at: now,
  };

  if (!isSupabaseConfigured) {
    return { data: row as unknown as UserProfile, error: null };
  }

  const { data, error } = await supabase
    .from('users')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  return { data: enrichProfile(data as UserProfile | null), error };
}

export async function fetchUserProfile(userId: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { data: enrichProfile(data as UserProfile | null), error };
}

export async function updateVerificationStatus(
  userId: string,
  status: UserProfile['verification_status'],
) {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase
    .from('users')
    .update({
      verification_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { error };
}

export async function enqueueVerification(userId: string) {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.from('verification_queue').insert({
    user_id: userId,
    status: 'waiting',
    submitted_at: new Date().toISOString(),
  });

  return { error };
}

export async function uploadVerificationDoc(
  userId: string,
  kind: 'id_front' | 'selfie',
  uri: string,
) {
  if (!isSupabaseConfigured) {
    return { path: `demo/${userId}/${kind}.jpg`, error: null };
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${userId}/${kind}-${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('verification-docs')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  return { path, error };
}

export async function signOut() {
  if (!isSupabaseConfigured) return { error: null };
  return supabase.auth.signOut();
}

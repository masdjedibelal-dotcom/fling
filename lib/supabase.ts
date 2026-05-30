import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Gültige Platzhalter-URL — nur für Demo ohne .env (Client wirft sonst beim Import) */
const DEMO_URL = 'https://placeholder.supabase.co';
const DEMO_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDg3MjAwMH0.demo';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

function isValidSupabaseUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u || u.includes('xxx') || u.includes('your-project')) return false;
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(u);
}

function isValidSupabaseAnonKey(key: string): boolean {
  const k = key.trim();
  if (!k || k.length < 100 || k.includes('...')) return false;
  if (k.endsWith('.demo')) return false;
  return k.split('.').length === 3;
}

export const isSupabaseConfigured =
  isValidSupabaseUrl(supabaseUrl) && isValidSupabaseAnonKey(supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : DEMO_URL,
  isSupabaseConfigured ? supabaseAnonKey : DEMO_KEY,
  {
    auth: {
      storage: Platform.OS === 'web' ? AsyncStorage : ExpoSecureStoreAdapter,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
      detectSessionInUrl: false,
    },
  },
);

import { router } from 'expo-router';

/** Zurück — mit Fallback wenn kein Stack-Eintrag (z. B. nach replace). */
export function safeBack(fallback: string = '/(tabs)') {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback as never);
}

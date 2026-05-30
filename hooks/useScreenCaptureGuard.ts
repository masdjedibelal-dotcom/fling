import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

/** Screenshots blockieren (nur iOS/Android). Web: No-Op. */
export function useScreenCaptureGuard(active = true) {
  useEffect(() => {
    if (Platform.OS === 'web' || !active) return;

    ScreenCapture.preventScreenCaptureAsync().catch(() => {});

    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    };
  }, [active]);
}

export function useDiscreetScreen() {
  useScreenCaptureGuard(true);
}

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import { AppLayoutProvider } from '@/components/app/AppLayoutProvider';
import { MOBILE_PREVIEW_MAX_WIDTH } from '@/lib/appLayout';

const SHELL_BG = '#0a0608';
const PREVIEW_REF_H = 844;
const PREVIEW_MAX_SCALE = 1.35;

/** Web-Preview größer darstellen, Layout bleibt iPhone-Breite (390). */
function previewScale(screenW: number, screenH: number): number {
  const pad = 40;
  const byW = (screenW - pad) / MOBILE_PREVIEW_MAX_WIDTH;
  const byH = (screenH - pad) / PREVIEW_REF_H;
  return Math.min(PREVIEW_MAX_SCALE, Math.max(1, Math.min(byW, byH)));
}

/** Web: zentrierter Smartphone-Preview — Native: unverändert voller Bildschirm. */
export function MobilePreviewFrame({ children }: { children: ReactNode }) {
  const { width: screenW, height: screenH } = useWindowDimensions();

  const scale = useMemo(
    () => (Platform.OS === 'web' ? previewScale(screenW, screenH) : 1),
    [screenW, screenH],
  );

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View
      style={{
        flex: 1,
        minHeight: '100%',
        width: '100%',
        backgroundColor: SHELL_BG,
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <View
        style={{
          width: MOBILE_PREVIEW_MAX_WIDTH,
          flex: 1,
          maxHeight: screenH,
          transform: [{ scale }],
          transformOrigin: 'top center',
        }}
      >
        <AppLayoutProvider>{children}</AppLayoutProvider>
      </View>
    </View>
  );
}

export { MOBILE_PREVIEW_MAX_WIDTH };

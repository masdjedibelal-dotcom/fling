import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '@/components/ui/BackButton';
import { ProfileFullscreenPage } from '@/components/schaufenster/ProfileFullscreenPage';
import type { SchaufensterProfile } from '@/lib/types';

/**
 * Öffentliches Profil — gleiche Vollbild-Darstellung wie Listenansicht.
 * @deprecated Bevorzugt `AuswahlProfileFeed` / `ProfileFullscreenPage` direkt.
 */
export function PublicProfileDetail({
  profile,
  footer,
  userId,
}: {
  profile: SchaufensterProfile;
  footer?: React.ReactNode;
  userId?: string;
}) {
  const insets = useSafeAreaInsets();
  const [pageHeight, setPageHeight] = useState(0);

  return (
    <View
      className="flex-1"
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0) setPageHeight(h);
      }}
    >
      {pageHeight > 0 ? (
        <ProfileFullscreenPage
          profile={profile}
          pageHeight={pageHeight}
          userId={userId}
          showPick={Boolean(footer && userId)}
          topOverlay={
            <View style={{ paddingTop: insets.top + 4 }}>
              <BackButton />
            </View>
          }
        />
      ) : null}
    </View>
  );
}

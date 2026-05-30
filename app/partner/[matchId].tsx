import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BodyText } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { ProfileFullscreenPage } from '@/components/schaufenster/ProfileFullscreenPage';
import { fetchPartnerProfile } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { SchaufensterProfile } from '@/lib/types';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';

export default function PartnerProfileScreen() {
  useDiscreetScreen();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const gender = useAuthStore((s) => s.gender) ?? 'female';
  const [profile, setProfile] = useState<SchaufensterProfile | null>(null);
  const [pageHeight, setPageHeight] = useState(0);

  useEffect(() => {
    if (!matchId) return;
    fetchPartnerProfile(matchId, gender).then((data) => {
      if (data) setProfile(data.profile);
    });
  }, [matchId, gender]);

  if (!profile) {
    return (
      <Screen className="items-center justify-center">
        <BodyText>Lädt…</BodyText>
      </Screen>
    );
  }

  return (
    <Screen edges={[]} className="flex-1">
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
            showPick={false}
            topOverlay={
              <BackButton
                onPress={() => {
                  if (router.canGoBack()) router.back();
                  else if (matchId) router.replace(`/chat/${matchId}`);
                  else router.replace('/(tabs)/pick');
                }}
              />
            }
          />
        ) : null}
      </View>
    </Screen>
  );
}

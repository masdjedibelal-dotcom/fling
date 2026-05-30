import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BodyText } from '@/components/ui/Typography';
import { SlideToPick } from '@/components/chat/SlideToPick';
import { PublicProfileDetail } from '@/components/schaufenster/PublicProfileDetail';
import { fetchSchaufensterProfile, createMatch } from '@/lib/api';
import { ensureDemoSession } from '@/lib/demoMode';
import { useAuthStore } from '@/stores/authStore';
import type { SchaufensterProfile } from '@/lib/types';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';
import { FLING_TYPE } from '@/lib/designTokens';

export default function SchaufensterDetailScreen() {
  useDiscreetScreen();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.userId) ?? 'demo-female-user';
  const [profile, setProfile] = useState<SchaufensterProfile | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    ensureDemoSession();
    if (id) fetchSchaufensterProfile(id).then(setProfile);
  }, [id]);

  if (!profile) {
    return (
      <Screen className="items-center justify-center">
        <BodyText>Lädt…</BodyText>
      </Screen>
    );
  }

  const onPick = async () => {
    setPicking(true);
    const { match, error } = await createMatch(userId, profile.id);
    setPicking(false);
    if (error) {
      alert(error);
      return;
    }
    if (match) router.replace(`/chat/${match.id}`);
  };

  return (
    <Screen edges={[]} className="flex-1">
      <PublicProfileDetail
        profile={profile}
        footer={
          <>
            <SlideToPick onPick={onPick} />
            {picking ? (
              <Text
                className="text-center text-fg-3 mt-2"
                style={{ fontSize: FLING_TYPE.caption2 }}
              >
                Verbindung wird hergestellt…
              </Text>
            ) : null}
          </>
        }
      />
    </Screen>
  );
}

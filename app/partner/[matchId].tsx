import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BodyText } from '@/components/ui/Typography';
import { PublicProfileDetail } from '@/components/schaufenster/PublicProfileDetail';
import { fetchPartnerProfile } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { SchaufensterProfile } from '@/lib/types';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';

export default function PartnerProfileScreen() {
  useDiscreetScreen();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const gender = useAuthStore((s) => s.gender) ?? 'female';
  const [profile, setProfile] = useState<SchaufensterProfile | null>(null);
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
      <PublicProfileDetail profile={profile} />
    </Screen>
  );
}

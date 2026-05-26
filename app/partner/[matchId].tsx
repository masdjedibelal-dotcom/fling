import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BodyText } from '@/components/ui/Typography';
import { PublicProfileDetail } from '@/components/schaufenster/PublicProfileDetail';
import { fetchPartnerProfile } from '@/lib/api';
import { statsForFemaleProfile, statsForMaleProfile } from '@/lib/partnerProfile';
import { useAuthStore } from '@/stores/authStore';
import type { SchaufensterProfile } from '@/lib/types';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';

export default function PartnerProfileScreen() {
  useDiscreetScreen();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const gender = useAuthStore((s) => s.gender) ?? 'female';
  const isFemale = gender === 'female';
  const [profile, setProfile] = useState<SchaufensterProfile | null>(null);
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    fetchPartnerProfile(matchId, gender).then((data) => {
      if (data) {
        setProfile(data.profile);
        setCity(data.city);
      }
    });
  }, [matchId, gender]);

  if (!profile) {
    return (
      <Screen className="items-center justify-center">
        <BodyText>Lädt…</BodyText>
      </Screen>
    );
  }

  const stats = isFemale
    ? statsForMaleProfile(profile)
    : statsForFemaleProfile(profile, city);

  return (
    <Screen edges={[]} className="flex-1">
      <PublicProfileDetail profile={profile} stats={stats} />
    </Screen>
  );
}

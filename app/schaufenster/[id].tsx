import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui/Screen';
import { BodyText } from '@/components/ui/Typography';
import { SlideToPick } from '@/components/chat/SlideToPick';
import { PublicProfileDetail } from '@/components/schaufenster/PublicProfileDetail';
import { fetchSchaufensterProfile, createMatch } from '@/lib/api';
import { statsForMaleProfile } from '@/lib/partnerProfile';
import { useAuthStore } from '@/stores/authStore';
import type { SchaufensterProfile } from '@/lib/types';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';

export default function SchaufensterDetailScreen() {
  useDiscreetScreen();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId) ?? 'demo-female-user';
  const [profile, setProfile] = useState<SchaufensterProfile | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
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
        stats={statsForMaleProfile(profile)}
        bottomInset={72}
        footer={
          <View
            className="absolute left-0 right-0 border-t border-line/80"
            style={{
              bottom: 0,
              paddingBottom: Math.max(insets.bottom, 10),
              paddingTop: 10,
              backgroundColor: 'rgba(14,13,13,0.96)',
            }}
          >
            <SlideToPick onPick={onPick} />
            {picking ? (
              <Text className="text-center text-fg-3 text-[10px] mt-1.5">
                Verbindung wird hergestellt…
              </Text>
            ) : null}
          </View>
        }
      />
    </Screen>
  );
}

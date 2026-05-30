import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BodyText } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { AuswahlProfileFeed } from '@/components/schaufenster/AuswahlProfileFeed';
import { useSchaufenster } from '@/hooks/useSchaufenster';
import { useAuthStore } from '@/stores/authStore';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';
import { ensureDemoSession } from '@/lib/demoMode';

export default function SchaufensterDetailScreen() {
  useDiscreetScreen();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useAuthStore((s) => s.userId) ?? 'demo-female-user';
  const profile = useAuthStore((s) => s.profile);
  const { profiles, loading } = useSchaufenster(
    profile?.latitude ?? undefined,
    profile?.longitude ?? undefined,
  );

  useEffect(() => {
    ensureDemoSession();
  }, []);

  const initialIndex = useMemo(() => {
    if (!id || profiles.length === 0) return 0;
    const idx = profiles.findIndex((p) => p.id === id);
    return idx >= 0 ? idx : 0;
  }, [id, profiles]);

  if (loading && profiles.length === 0) {
    return (
      <Screen className="items-center justify-center">
        <BodyText>Lädt…</BodyText>
      </Screen>
    );
  }

  if (profiles.length === 0) {
    return (
      <Screen className="items-center justify-center px-6">
        <BodyText className="text-center">Profil nicht gefunden.</BodyText>
        <View className="mt-4">
          <BackButton />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={[]} className="flex-1">
      <AuswahlProfileFeed
        profiles={profiles}
        userId={userId}
        initialIndex={initialIndex}
        fixedTopOverlay={<BackButton />}
      />
    </Screen>
  );
}

import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { MasonryGrid } from '@/components/schaufenster/MasonryGrid';
import { AuswahlEmptyState } from '@/components/schaufenster/AuswahlEmptyState';
import { MaleHomeView } from '@/components/schaufenster/MaleHomeView';
import { useSchaufenster } from '@/hooks/useSchaufenster';
import { useMatch } from '@/hooks/useMatch';
import { useAuthStore } from '@/stores/authStore';
import {
  pushSupported,
  registerForPushNotificationsAsync,
} from '@/lib/notifications';
import { useEffect } from 'react';
import { ensureDemoSession } from '@/lib/demoMode';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';

function FemaleAuswahl({
  loading,
  profiles,
}: {
  loading: boolean;
  profiles: Parameters<typeof MasonryGrid>[0]['profiles'];
}) {
  useDiscreetScreen();

  return (
    <Screen edges={[]}>
      {loading ? (
        <View className="flex-1 px-1 pt-2">
          <GridSkeleton />
        </View>
      ) : profiles.length === 0 ? (
        <AuswahlEmptyState />
      ) : (
        <MasonryGrid profiles={profiles} />
      )}
    </Screen>
  );
}

export default function HomeScreen() {
  const gender = useAuthStore((s) => s.gender);
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);
  const { profiles, loading } = useSchaufenster(
    profile?.latitude ?? undefined,
    profile?.longitude ?? undefined,
  );
  const { match } = useMatch(userId);

  useEffect(() => {
    ensureDemoSession();
  }, []);

  useEffect(() => {
    if (userId && pushSupported) registerForPushNotificationsAsync(userId);
  }, [userId]);

  if (gender === 'male') {
    return (
      <Screen edges={[]}>
        <MaleHomeView match={match} />
      </Screen>
    );
  }

  return <FemaleAuswahl loading={loading} profiles={profiles} />;
}

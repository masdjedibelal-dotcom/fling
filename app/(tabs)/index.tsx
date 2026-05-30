import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { GridSkeleton } from '@/components/ui/Skeleton';
import { AuswahlHeader } from '@/components/schaufenster/AuswahlHeader';
import { AuswahlHome } from '@/components/schaufenster/AuswahlHome';
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
  activeCount,
  userId,
  onRefresh,
}: {
  loading: boolean;
  profiles: Parameters<typeof AuswahlHome>[0]['profiles'];
  activeCount: number;
  userId: string;
  onRefresh: () => void;
}) {
  useDiscreetScreen();

  return (
    <Screen edges={[]}>
      {loading && profiles.length === 0 ? (
        <View className="flex-1">
          <AuswahlHeader
            activeCount={0}
            viewMode="grid"
            onNearbyPress={() => {}}
            onViewModePress={() => {}}
            loading
          />
          <View className="flex-1 px-1 pt-2">
            <GridSkeleton />
          </View>
        </View>
      ) : profiles.length === 0 ? (
        <AuswahlEmptyState />
      ) : (
        <AuswahlHome
          profiles={profiles}
          activeCount={activeCount}
          userId={userId}
          onRefresh={onRefresh}
          refreshing={loading && profiles.length > 0}
        />
      )}
    </Screen>
  );
}

export default function HomeScreen() {
  const gender = useAuthStore((s) => s.gender);
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);
  const { profiles, loading, activeCount, reload } = useSchaufenster(
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

  return (
    <FemaleAuswahl
      loading={loading}
      profiles={profiles}
      activeCount={activeCount}
      userId={userId ?? 'demo-female-user'}
      onRefresh={reload}
    />
  );
}

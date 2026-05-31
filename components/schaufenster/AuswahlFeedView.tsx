import { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuswahlHeader } from './AuswahlHeader';
import { AuswahlProfileFeed } from './AuswahlProfileFeed';
import { RadiusSheet } from './RadiusSheet';
import { useAppStore } from '@/stores/appStore';
import { FLING_COLORS } from '@/lib/designTokens';
import type { SchaufensterProfile } from '@/lib/types';

export function AuswahlFeedView({
  profiles,
  activeCount,
  userId,
  radiusSheetOpen,
  onRadiusClose,
  onNearbyPress,
  onViewModePress,
  onRefresh,
  refreshing,
}: {
  profiles: SchaufensterProfile[];
  activeCount: number;
  userId: string;
  radiusSheetOpen: boolean;
  onRadiusClose: () => void;
  onNearbyPress: () => void;
  onViewModePress: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const viewMode = useAppStore((s) => s.auswahlViewMode);
  const feedStartProfileId = useAppStore((s) => s.feedStartProfileId);
  const setFeedStartProfileId = useAppStore((s) => s.setFeedStartProfileId);

  const scrollIndex = useMemo(() => {
    if (!feedStartProfileId) return 0;
    return profiles.findIndex((p) => p.id === feedStartProfileId);
  }, [feedStartProfileId, profiles]);

  const waitingForProfile =
    Boolean(feedStartProfileId) && scrollIndex < 0 && profiles.length > 0;

  useEffect(() => {
    if (!waitingForProfile) return;
    const t = setTimeout(() => setFeedStartProfileId(null), 1200);
    return () => clearTimeout(t);
  }, [waitingForProfile, setFeedStartProfileId]);

  return (
    <View className="flex-1">
      {waitingForProfile ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={FLING_COLORS.accent} />
        </View>
      ) : (
        <AuswahlProfileFeed
          key={
            feedStartProfileId
              ? `${feedStartProfileId}-${scrollIndex}`
              : 'auswahl-feed'
          }
          profiles={profiles}
          userId={userId}
          initialIndex={feedStartProfileId ? Math.max(0, scrollIndex) : 0}
          scrollEnabled={!radiusSheetOpen}
          hasFeedHeader
          onRefresh={onRefresh}
          refreshing={refreshing}
          onInitialScrollDone={() => setFeedStartProfileId(null)}
        />
      )}

      <View
        className="absolute top-0 left-0 right-0"
        pointerEvents="box-none"
        style={{ zIndex: 40, elevation: 40 }}
      >
        <AuswahlHeader
          activeCount={activeCount}
          viewMode={viewMode}
          onNearbyPress={onNearbyPress}
          onViewModePress={onViewModePress}
          overlay
          showStatus={false}
        />
      </View>

      <RadiusSheet visible={radiusSheetOpen} onClose={onRadiusClose} />
    </View>
  );
}

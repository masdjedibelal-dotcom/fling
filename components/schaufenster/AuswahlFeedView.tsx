import { useEffect } from 'react';
import { View } from 'react-native';
import { AuswahlHeader } from './AuswahlHeader';
import { AuswahlProfileFeed } from './AuswahlProfileFeed';
import { RadiusSheet } from './RadiusSheet';
import { useAppStore } from '@/stores/appStore';
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

  const startIndex = feedStartProfileId
    ? Math.max(0, profiles.findIndex((p) => p.id === feedStartProfileId))
    : 0;

  useEffect(() => {
    if (feedStartProfileId && profiles.length > 0) {
      const idx = profiles.findIndex((p) => p.id === feedStartProfileId);
      if (idx < 0) setFeedStartProfileId(null);
    }
  }, [feedStartProfileId, profiles, setFeedStartProfileId]);

  return (
    <View className="flex-1">
      <AuswahlProfileFeed
        profiles={profiles}
        userId={userId}
        initialIndex={startIndex}
        scrollEnabled={!radiusSheetOpen}
        hasFeedHeader
        onRefresh={onRefresh}
        refreshing={refreshing}
        onInitialScrollDone={() => setFeedStartProfileId(null)}
      />

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

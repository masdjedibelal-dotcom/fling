import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MasonryGrid } from './MasonryGrid';
import { AuswahlFeedView } from './AuswahlFeedView';
import { useAppStore } from '@/stores/appStore';
import type { SchaufensterProfile } from '@/lib/types';

export function AuswahlHome({
  profiles,
  activeCount,
  userId,
  onRefresh,
  refreshing,
}: {
  profiles: SchaufensterProfile[];
  activeCount: number;
  userId: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const viewMode = useAppStore((s) => s.auswahlViewMode);
  const radiusSheetOpen = useAppStore((s) => s.radiusSheetOpen);
  const setRadiusSheetOpen = useAppStore((s) => s.setRadiusSheetOpen);
  const toggleAuswahlViewMode = useAppStore((s) => s.toggleAuswahlViewMode);
  const fade = useSharedValue(1);

  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: 260 });
  }, [viewMode, fade]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  const onNearbyPress = () => setRadiusSheetOpen(!radiusSheetOpen);
  const onViewModePress = () => toggleAuswahlViewMode();
  const onRadiusClose = () => setRadiusSheetOpen(false);

  return (
    <Animated.View style={[{ flex: 1 }, fadeStyle]}>
      {viewMode === 'feed' ? (
        <AuswahlFeedView
          profiles={profiles}
          activeCount={activeCount}
          userId={userId}
          radiusSheetOpen={radiusSheetOpen}
          onRadiusClose={onRadiusClose}
          onNearbyPress={onNearbyPress}
          onViewModePress={onViewModePress}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      ) : (
        <MasonryGrid
          profiles={profiles}
          activeCount={activeCount}
          radiusSheetOpen={radiusSheetOpen}
          onNearbyPress={onNearbyPress}
          onViewModePress={onViewModePress}
          onRadiusClose={onRadiusClose}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </Animated.View>
  );
}

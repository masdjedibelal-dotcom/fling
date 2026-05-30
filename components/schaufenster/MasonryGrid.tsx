import { RefreshControl, ScrollView, View } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileTile } from './ProfileTile';
import { AuswahlHeader } from './AuswahlHeader';
import { RadiusSheet } from './RadiusSheet';
import { useAppStore } from '@/stores/appStore';
import { FLING_COLORS } from '@/lib/designTokens';
import { triggerHaptic } from '@/lib/haptics';
import type { SchaufensterProfile } from '@/lib/types';

const COLUMN_COUNT = 3;
const HORIZONTAL_PADDING = 8;
const COLUMN_GAP = 8;

const TILE_ASPECT_RATIOS = [3 / 4, 3 / 5.5, 4 / 5, 3 / 4.8, 3 / 5.2] as const;

function tileAspectRatio(index: number): number {
  return TILE_ASPECT_RATIOS[index % TILE_ASPECT_RATIOS.length];
}

function columnStaggerOffset(colWidth: number): number {
  return Math.round(colWidth * 0.42);
}

export function MasonryGrid({
  profiles,
  activeCount,
  radiusSheetOpen,
  onNearbyPress,
  onViewModePress,
  onRadiusClose,
  onRefresh,
  refreshing = false,
}: {
  profiles: SchaufensterProfile[];
  activeCount: number;
  radiusSheetOpen: boolean;
  onNearbyPress: () => void;
  onViewModePress: () => void;
  onRadiusClose: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useAppDimensions();
  const viewMode = useAppStore((s) => s.auswahlViewMode);
  const setAuswahlViewMode = useAppStore((s) => s.setAuswahlViewMode);
  const setFeedStartProfileId = useAppStore((s) => s.setFeedStartProfileId);

  const openInFeed = (profileId: string) => {
    setFeedStartProfileId(profileId);
    setAuswahlViewMode('feed');
  };

  const colWidth = Math.floor(
    (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP * (COLUMN_COUNT - 1)) /
      COLUMN_COUNT,
  );

  const columns: { profile: SchaufensterProfile; globalIndex: number }[][] = [
    [],
    [],
    [],
  ];
  profiles.forEach((profile, index) => {
    columns[index % COLUMN_COUNT].push({ profile, globalIndex: index });
  });

  const tabBarClearance = 56 + Math.max(insets.bottom, 12);
  const stagger = columnStaggerOffset(colWidth);

  return (
    <View className="flex-1">
      <View style={{ zIndex: 40, elevation: 40 }}>
        <AuswahlHeader
          activeCount={activeCount}
          viewMode={viewMode}
          onNearbyPress={onNearbyPress}
          onViewModePress={onViewModePress}
        />
      </View>

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!radiusSheetOpen}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  triggerHaptic('light');
                  onRefresh();
                }}
                tintColor={FLING_COLORS.accent}
                colors={[FLING_COLORS.accent]}
              />
            ) : undefined
          }
          contentContainerStyle={{
            paddingBottom: tabBarClearance,
            paddingHorizontal: HORIZONTAL_PADDING,
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: COLUMN_GAP,
              width: '100%',
              maxWidth: screenWidth,
            }}
          >
            {columns.map((column, colIndex) => (
              <View
                key={colIndex}
                style={{
                  width: colWidth,
                  flexShrink: 0,
                  gap: COLUMN_GAP,
                  paddingTop: colIndex === 1 ? stagger : 0,
                }}
              >
                {column.map(({ profile, globalIndex }) => (
                  <ProfileTile
                    key={profile.id}
                    profile={profile}
                    width={colWidth}
                    aspectRatio={tileAspectRatio(globalIndex)}
                    onPress={() => openInFeed(profile.id)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <RadiusSheet visible={radiusSheetOpen} onClose={onRadiusClose} />
      </View>
    </View>
  );
}

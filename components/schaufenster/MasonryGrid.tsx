import { ScrollView, View } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ProfileTile } from './ProfileTile';
import { AuswahlHeader } from './AuswahlHeader';
import { FilterSheet } from './FilterSheet';
import type { SchaufensterProfile } from '@/lib/types';

const COLUMN_COUNT = 3;
const HORIZONTAL_PADDING = 8;
const COLUMN_GAP = 8;

/** Abwechselnde Kachelhöhen — Masonry wie im Mock (nicht einheitliches Raster) */
const TILE_ASPECT_RATIOS = [3 / 4, 3 / 5.5, 4 / 5, 3 / 4.8, 3 / 5.2] as const;

function tileAspectRatio(index: number): number {
  return TILE_ASPECT_RATIOS[index % TILE_ASPECT_RATIOS.length];
}

/** Mittlere Spalte halb Kachel nach unten versetzt (Zick-Zack) */
function columnStaggerOffset(colWidth: number): number {
  return Math.round(colWidth * 0.42);
}

export function MasonryGrid({
  profiles,
  filterOpen,
  onFilterPress,
  onFilterClose,
}: {
  profiles: SchaufensterProfile[];
  filterOpen: boolean;
  onFilterPress: () => void;
  onFilterClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useAppDimensions();

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
      <AuswahlHeader
        activeCount={profiles.length}
        onFilterPress={onFilterPress}
        filterActive={filterOpen}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!filterOpen}
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
                    onPress={() => router.push(`/schaufenster/${profile.id}`)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <FilterSheet visible={filterOpen} onClose={onFilterClose} />
      </View>
    </View>
  );
}

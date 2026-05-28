import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ProfileTile } from './ProfileTile';
import type { SchaufensterProfile } from '@/lib/types';

export function MasonryGrid({ profiles }: { profiles: SchaufensterProfile[] }) {
  const insets = useSafeAreaInsets();
  const cols: SchaufensterProfile[][] = [[], [], []];
  profiles.forEach((p, i) => cols[i % 3].push(p));

  const ratios = [3 / 4, 5 / 6, 3 / 4, 4 / 5];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: 'transparent' }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: 8,
        paddingHorizontal: 3,
      }}
    >
      <View className="flex-row" style={{ gap: 3 }}>
        {cols.map((col, colIdx) => (
          <View
            key={colIdx}
            style={{
              flex: 1,
              gap: 3,
              marginTop: colIdx === 1 ? 44 : 0,
            }}
          >
            {col.map((profile, rowIdx) => (
              <ProfileTile
                key={profile.id}
                profile={profile}
                aspectRatio={ratios[rowIdx % ratios.length]}
                onPress={() => router.push(`/schaufenster/${profile.id}`)}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

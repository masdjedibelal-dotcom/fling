import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import type { SchaufensterProfile } from '@/lib/types';
import { formatDistance, onlineStatus, tileStatusLabel } from '@/lib/profileStatus';

const tileTextShadow = {
  textShadowColor: 'rgba(0,0,0,0.85)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 5,
} as const;

export function ProfileTile({
  profile,
  aspectRatio,
  onPress,
}: {
  profile: SchaufensterProfile;
  aspectRatio: number;
  onPress: () => void;
}) {
  const photo = profile.photos[profile.primary_photo_idx] ?? profile.photos[0];
  const { dotColor } = onlineStatus(profile);
  const meta = `${formatDistance(profile.distance_km)} · ${tileStatusLabel(profile)}`;

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden bg-surface"
      style={{ aspectRatio, borderRadius: 12 }}
    >
      <Image source={{ uri: photo }} className="w-full h-full" contentFit="cover" />

      <View className="absolute top-2.5 left-2.5">
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
            shadowColor: dotColor,
            shadowOpacity: 0.75,
            shadowRadius: 5,
          }}
        />
      </View>

      <View className="absolute bottom-2 left-2.5 right-2">
        <Text
          className="text-white text-[11px] font-semibold tracking-tight"
          style={tileTextShadow}
          numberOfLines={1}
        >
          {meta}
        </Text>
      </View>
    </Pressable>
  );
}

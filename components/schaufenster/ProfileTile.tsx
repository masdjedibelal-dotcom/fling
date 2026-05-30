import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { SchaufensterProfile } from '@/lib/types';
import { onlineStatus, tileDistanceLabel } from '@/lib/profileStatus';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

const tileTextShadow = {
  textShadowColor: 'rgba(0,0,0,0.85)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 5,
} as const;

export function ProfileTile({
  profile,
  width,
  aspectRatio,
  onPress,
}: {
  profile: SchaufensterProfile;
  width: number;
  aspectRatio: number;
  onPress: () => void;
}) {
  const photo = profile.photos[profile.primary_photo_idx] ?? profile.photos[0];
  const { dotColor } = onlineStatus(profile);
  const distanceLabel = tileDistanceLabel(profile);
  const height = width / aspectRatio;

  return (
    <Pressable
      onPress={onPress}
      style={{
        width,
        aspectRatio,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: FLING_COLORS.card,
      }}
    >
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{ width, height }}
          contentFit="cover"
        />
      ) : null}

      <LinearGradient
        colors={['transparent', 'rgba(18,10,12,0.55)', 'rgba(18,10,12,0.88)']}
        locations={[0.35, 0.72, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

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

      <View className="absolute bottom-2.5 left-2.5 right-2">
        <Text
          className="text-white font-semibold tracking-tight"
          style={{ ...tileTextShadow, fontSize: FLING_TYPE.subhead }}
          numberOfLines={1}
        >
          {distanceLabel}
        </Text>
      </View>
    </Pressable>
  );
}

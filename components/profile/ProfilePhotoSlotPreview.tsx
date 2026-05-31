import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ProfileMediaSlide } from '@/components/schaufenster/ProfileMediaSlide';
import { getProfileMediaUri, isProfileVideo } from '@/lib/profileMedia';

type Props = {
  uri: string;
  width: number;
  height: number;
};

/** Vorschau in Profil-Kacheln — feste Maße, Bilder & Videos. */
export function ProfilePhotoSlotPreview({ uri, width, height }: Props) {
  if (isProfileVideo(uri)) {
    return (
      <View style={{ width, height, overflow: 'hidden' }}>
        <ProfileMediaSlide uri={uri} isActive contentFit="cover" />
        <View style={styles.videoBadge}>
          <Text style={styles.videoBadgeText}>▶</Text>
        </View>
      </View>
    );
  }

  const imageUri = getProfileMediaUri(uri);

  return (
    <Image
      source={{ uri: imageUri }}
      style={{ width, height }}
      contentFit="cover"
      recyclingKey={imageUri}
    />
  );
}

const styles = StyleSheet.create({
  videoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

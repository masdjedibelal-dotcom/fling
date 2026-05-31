import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { MAX_PHOTOS } from '@/lib/constants';
import { pickProfileMediaFromGallery } from '@/lib/pickProfileMedia';
import { ProfilePhotoSlotPreview } from '@/components/profile/ProfilePhotoSlotPreview';
import { toProfileVideoStorage } from '@/lib/profileMedia';

const TILE_W = 72;
const TILE_H = 84;
const GAP = 8;

export function ProfilePhotoRow({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const addPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    const picked = await pickProfileMediaFromGallery({ allowVideo: true });
    if (!picked) return;
    const uri = picked.isVideo
      ? toProfileVideoStorage(picked.uri)
      : picked.uri;
    onChange([...photos, uri]);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const slots = photos.length < MAX_PHOTOS ? [...photos, ''] : photos;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: GAP, paddingVertical: 4 }}
      className="mb-4"
    >
      {slots.map((uri, i) => {
        const isEmpty = !uri;
        const isPrimary = i === 0 && !isEmpty;
        return (
          <Pressable
            key={`${i}-${uri || 'add'}`}
            onPress={isEmpty ? () => void addPhoto() : undefined}
            style={[
              styles.tile,
              isPrimary ? styles.tilePrimary : styles.tileDefault,
            ]}
          >
            {uri ? (
              <>
                <ProfilePhotoSlotPreview uri={uri} width={TILE_W} height={TILE_H} />
                <Pressable
                  onPress={() => removePhoto(i)}
                  style={styles.removeBtn}
                  hitSlop={6}
                >
                  <FlingIcon name="close" size={12} color="#fff" />
                </Pressable>
                {isPrimary ? (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>1</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.addInner}>
                <FlingIcon name="plus" size={22} color="rgba(255,255,255,0.35)" />
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: TILE_W,
    height: TILE_H,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1A1214',
  },
  tilePrimary: {
    borderWidth: 2,
    borderColor: '#C41E3A',
  },
  tileDefault: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  addInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(196, 30, 58, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
  },
});

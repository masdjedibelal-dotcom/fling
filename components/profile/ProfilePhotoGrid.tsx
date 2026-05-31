import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MetaText } from '@/components/ui/Typography';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { MAX_PHOTOS } from '@/lib/constants';
import { pickProfileMediaFromGallery } from '@/lib/pickProfileMedia';
import { ProfilePhotoSlotPreview } from '@/components/profile/ProfilePhotoSlotPreview';
import { toProfileVideoStorage } from '@/lib/profileMedia';
import { FLING_TYPE } from '@/lib/designTokens';

const GAP = 8;
const COLS = 3;

export function ProfilePhotoGrid({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const { width } = useAppDimensions();
  const tileW = (width - 32 - GAP * (COLS - 1)) / COLS;
  const tileH = tileW * 1.25;

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

  const displaySlots =
    photos.length < MAX_PHOTOS ? [...photos, ''] : photos.slice(0, MAX_PHOTOS);

  return (
    <View className="mb-5">
      <MetaText className="text-fg-4 mb-3 normal-case">
        Bis zu {MAX_PHOTOS} Fotos — das erste ist dein Hauptbild.
      </MetaText>
      <View className="flex-row flex-wrap" style={{ gap: GAP }}>
        {displaySlots.map((uri, i) => {
          const isEmpty = !uri;
          const isPrimary = i === 0 && !isEmpty;

          return (
            <Pressable
              key={`${i}-${uri || 'empty'}`}
              onPress={isEmpty ? () => void addPhoto() : undefined}
              style={[
                styles.tile,
                { width: tileW, height: tileH },
                isPrimary ? styles.tilePrimary : styles.tileDefault,
              ]}
            >
              {uri ? (
                <>
                  <ProfilePhotoSlotPreview uri={uri} width={tileW} height={tileH} />
                  <Pressable
                    onPress={() => removePhoto(i)}
                    hitSlop={8}
                    style={styles.removeBtn}
                  >
                    <FlingIcon name="close" size={14} color="#fff" />
                  </Pressable>
                  {isPrimary ? (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Haupt</Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View style={styles.addInner}>
                  <FlingIcon name="plus" size={28} color="rgba(255,255,255,0.35)" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
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
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#C41E3A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: FLING_TYPE.caption2,
    fontWeight: '600',
  },
});

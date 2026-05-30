import { View, Text, Pressable } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { MAX_PHOTOS } from '@/lib/constants';
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    onChange([...photos, result.assets[0].uri]);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const displaySlots =
    photos.length < MAX_PHOTOS ? [...photos, ''] : photos.slice(0, MAX_PHOTOS);

  return (
    <View className="flex-row flex-wrap mb-5" style={{ gap: GAP }}>
      {displaySlots.map((uri, i) => {
        const isEmpty = !uri;
        const isPrimary = i === 0 && !isEmpty;

        return (
          <Pressable
            key={`${i}-${uri || 'empty'}`}
            onPress={isEmpty ? addPhoto : undefined}
            style={{ width: tileW, height: tileH }}
            className={`rounded-md overflow-hidden bg-card border ${
              isPrimary ? 'border-accent' : 'border-line'
            }`}
          >
            {uri ? (
              <>
                <Image source={{ uri }} className="w-full h-full" contentFit="cover" />
                <Pressable
                  onPress={() => removePhoto(i)}
                  hitSlop={8}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/65 items-center justify-center"
                >
                  <FlingIcon name="close" size={14} color="#fff" />
                </Pressable>
                {isPrimary ? (
                  <View className="absolute bottom-1.5 left-1.5 bg-accent px-2 py-0.5 rounded-pill">
                    <Text
                      className="text-white font-semibold"
                      style={{ fontSize: FLING_TYPE.caption2 }}
                    >
                      Haupt
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View className="flex-1 items-center justify-center">
                <FlingIcon name="plus" size={28} color="rgba(255,255,255,0.35)" />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

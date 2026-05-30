import { ScrollView, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { MAX_PHOTOS } from '@/lib/constants';

const TILE = 72;
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
            onPress={isEmpty ? addPhoto : undefined}
            style={{ width: TILE, height: TILE * 1.15 }}
            className={`rounded-md overflow-hidden bg-card border ${
              isPrimary ? 'border-accent' : 'border-line'
            }`}
          >
            {uri ? (
              <>
                <Image source={{ uri }} className="w-full h-full" contentFit="cover" />
                <Pressable
                  onPress={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 items-center justify-center"
                >
                  <FlingIcon name="close" size={12} color="#fff" />
                </Pressable>
                {isPrimary ? (
                  <View className="absolute bottom-1 left-1 bg-accent/90 px-1.5 py-0.5 rounded">
                    <Text className="text-white text-[8px] font-bold">1</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View className="flex-1 items-center justify-center">
                <FlingIcon name="plus" size={22} color="rgba(255,255,255,0.35)" />
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

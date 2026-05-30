import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { ScreenTitle, BodyLarge, MetaText } from '@/components/ui/Typography';
import { PermissionSheet } from '@/components/auth/PermissionSheet';
import { useAuthStore } from '@/stores/authStore';
import { updateUserProfile } from '@/lib/api';
import { MAX_PHOTOS } from '@/lib/constants';
import {
  getProfileMediaUri,
  isProfileVideo,
  MAX_PROFILE_VIDEO_SEC,
  toProfileVideoStorage,
} from '@/lib/profileMedia';

export default function PhotosScreen() {
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [photos, setPhotos] = useState<string[]>(profile?.photos ?? []);
  const [permOpen, setPermOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const addMedia = async (slot: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      videoMaxDuration: MAX_PROFILE_VIDEO_SEC,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const uri =
      asset.type === 'video'
        ? toProfileVideoStorage(asset.uri)
        : asset.uri;
    const next = [...photos];
    next[slot] = uri;
    setPhotos(next.filter(Boolean).slice(0, MAX_PHOTOS));
  };

  const save = async () => {
    if (!userId || !profile) return;
    setSaving(true);
    const cleaned = photos.filter(Boolean).slice(0, MAX_PHOTOS);
    await updateUserProfile(userId, {
      photos: cleaned,
      primary_photo_idx: 0,
    });
    setProfile({ ...profile, photos: cleaned, primary_photo_idx: 0 });
    setSaving(false);
    router.back();
  };

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i]);
  const filledCount = photos.filter(Boolean).length;

  return (
    <Screen className="px-4 pt-2">
      <View className="flex-row items-center gap-3 mb-2">
        <BackButton />
        <ScreenTitle className="flex-1">Fotos & Videos</ScreenTitle>
      </View>
      <BodyLarge className="text-fg-3 mb-6 text-center leading-7 px-2">
        Bis zu {MAX_PHOTOS} Medien — Bilder oder Kurzvideos (max. {MAX_PROFILE_VIDEO_SEC}s).
        Slot 1 ist dein Hauptbild in der Auswahl.
      </BodyLarge>

      <View className="flex-row flex-wrap gap-3 justify-center mb-8">
        {slots.map((uri, i) => (
          <Pressable
            key={i}
            onPress={() => {
              if (filledCount >= MAX_PHOTOS && !uri) return;
              void addMedia(i);
            }}
            className={`w-[100px] h-[120px] rounded-md overflow-hidden border ${
              i === 0 ? 'border-accent' : 'border-line'
            } bg-card items-center justify-center`}
          >
            {uri ? (
              isProfileVideo(uri) ? (
                <View className="w-full h-full bg-bg2 items-center justify-center">
                  <Text className="text-fg-2 text-xs font-semibold">▶ Video</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: getProfileMediaUri(uri) }}
                  className="w-full h-full"
                  contentFit="cover"
                />
              )
            ) : (
              <MetaText className="text-fg-4 text-2xl normal-case">+</MetaText>
            )}
            <View className="absolute bottom-1.5 left-1.5 bg-black/65 px-2 py-0.5 rounded">
              <MetaText className="text-white normal-case tracking-normal">
                {i === 0 ? 'Haupt' : String(i + 1)}
              </MetaText>
            </View>
          </Pressable>
        ))}
      </View>

      <Button label="Speichern" loading={saving} onPress={save} />

      <PermissionSheet
        visible={permOpen}
        icon="images"
        title="Medien auswählen"
        description="Fotos oder kurze Videos (max. 3 Sekunden) für dein Profil."
        primaryLabel="Aus Mediathek wählen"
        secondaryLabel="Abbrechen"
        onPrimary={() => {
          setPermOpen(false);
          const emptySlot = slots.findIndex((p) => !p);
          void addMedia(emptySlot >= 0 ? emptySlot : 0);
        }}
        onSecondary={() => setPermOpen(false)}
      />
    </Screen>
  );
}

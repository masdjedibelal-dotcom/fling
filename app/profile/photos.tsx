import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { PermissionSheet } from '@/components/auth/PermissionSheet';
import { useAuthStore } from '@/stores/authStore';
import { updateUserProfile } from '@/lib/api';
import { MAX_PHOTOS } from '@/lib/constants';

export default function PhotosScreen() {
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [photos, setPhotos] = useState<string[]>(profile?.photos ?? []);
  const [permOpen, setPermOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const addPhoto = async (slot: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    const next = [...photos];
    next[slot] = uri;
    while (next.length < MAX_PHOTOS) next.push('');
    setPhotos(next.filter(Boolean));
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

  return (
    <Screen className="px-4 pt-2">
      <View className="flex-row items-center gap-3 mb-2">
        <BackButton />
        <DisplayText className="text-xl">Fotos verwalten</DisplayText>
      </View>
      <BodyText className="text-fg-3 mb-6 text-center">
        Mit zwei Fingern zoomen — Foto 1 ist dein Hauptbild.
      </BodyText>

      <View className="flex-row flex-wrap gap-3 justify-center mb-8">
        {slots.map((uri, i) => (
          <Pressable
            key={i}
            onPress={() => (uri ? undefined : setPermOpen(true))}
            className={`w-[100px] h-[120px] rounded-md overflow-hidden border ${
              i === 0 ? 'border-accent' : 'border-line'
            } bg-card items-center justify-center`}
          >
            {uri ? (
              <Image source={{ uri }} className="w-full h-full" contentFit="cover" />
            ) : (
              <BodyText className="text-fg-4">+</BodyText>
            )}
            <View className="absolute bottom-1 left-1 bg-black/60 px-1.5 rounded">
              <BodyText className="text-[10px] text-white">
                {i === 0 ? 'Haupt' : String(i + 1)}
              </BodyText>
            </View>
          </Pressable>
        ))}
      </View>

      <Button label="Speichern" loading={saving} onPress={save} />

      <PermissionSheet
        visible={permOpen}
        icon="images-outline"
        title="Wähle deine\nProfil-Fotos"
        description="Du kannst auch nur einzelne Fotos teilen — wir greifen nicht auf den Rest zu."
        primaryLabel="Fotos auswählen"
        secondaryLabel="Abbrechen"
        onPrimary={() => {
          setPermOpen(false);
          const emptySlot = slots.findIndex((p) => !p);
          addPhoto(emptySlot >= 0 ? emptySlot : 0);
        }}
        onSecondary={() => setPermOpen(false)}
      />
    </Screen>
  );
}

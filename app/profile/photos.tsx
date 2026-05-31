import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { ScreenTitle, BodyLarge, MetaText } from '@/components/ui/Typography';
import { PermissionSheet } from '@/components/auth/PermissionSheet';
import { ProfilePhotoSlotPreview } from '@/components/profile/ProfilePhotoSlotPreview';
import { useAuthStore } from '@/stores/authStore';
import { updateUserProfile } from '@/lib/api';
import { MAX_PHOTOS } from '@/lib/constants';
import { pickProfileMediaFromGallery } from '@/lib/pickProfileMedia';
import { MAX_PROFILE_VIDEO_SEC, toProfileVideoStorage } from '@/lib/profileMedia';

const SLOT_W = 100;
const SLOT_H = 120;

function normalizeSlots(photos: string[]): string[] {
  return Array.from({ length: MAX_PHOTOS }, (_, i) => photos[i] ?? '');
}

export default function PhotosScreen() {
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const [photos, setPhotos] = useState<string[]>(() =>
    normalizeSlots(profile?.photos ?? []),
  );
  const [permOpen, setPermOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const slots = normalizeSlots(photos);
  const filledCount = slots.filter(Boolean).length;

  const applyPickedMedia = (slot: number, uri: string) => {
    const next = normalizeSlots(photos);
    next[slot] = uri;
    setPhotos(next);
  };

  const openGalleryForSlot = async (slot: number) => {
    const picked = await pickProfileMediaFromGallery({ allowVideo: true });
    if (!picked) return;
    const stored = picked.isVideo
      ? toProfileVideoStorage(picked.uri)
      : picked.uri;
    applyPickedMedia(slot, stored);
  };

  const handleSlotPress = (slot: number) => {
    if (filledCount >= MAX_PHOTOS && !slots[slot]) return;
    setPendingSlot(slot);
    setPermOpen(true);
  };

  const save = async () => {
    if (!userId || !profile) return;
    setSaving(true);
    const cleaned = slots.filter(Boolean).slice(0, MAX_PHOTOS);
    await updateUserProfile(userId, {
      photos: cleaned,
      primary_photo_idx: 0,
    });
    setProfile({ ...profile, photos: cleaned, primary_photo_idx: 0 });
    setSaving(false);
    router.back();
  };

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
            key={`slot-${i}-${uri || 'empty'}`}
            onPress={() => handleSlotPress(i)}
            style={{
              width: SLOT_W,
              height: SLOT_H,
              borderRadius: 10,
              overflow: 'hidden',
              borderWidth: i === 0 ? 2 : 1,
              borderColor: i === 0 ? '#C41E3A' : 'rgba(255,255,255,0.12)',
              backgroundColor: '#1A1214',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {uri ? (
              <ProfilePhotoSlotPreview uri={uri} width={SLOT_W} height={SLOT_H} />
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
        description="Wähle Fotos oder kurze Videos (max. 3 Sekunden) aus deiner Galerie für dein Profil."
        primaryLabel="Galerie öffnen"
        secondaryLabel="Abbrechen"
        onPrimary={() => {
          setPermOpen(false);
          if (pendingSlot != null) void openGalleryForSlot(pendingSlot);
        }}
        onSecondary={() => {
          setPermOpen(false);
          setPendingSlot(null);
        }}
      />
    </Screen>
  );
}

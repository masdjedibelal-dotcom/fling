import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MAX_PROFILE_VIDEO_SEC } from '@/lib/profileMedia';

export type PickedProfileMedia = {
  uri: string;
  isVideo: boolean;
};

function showMediaLibraryDeniedAlert() {
  Alert.alert(
    'Mediathek',
    'Bitte erlaube den Zugriff auf deine Fotos in den Einstellungen, damit du Bilder für dein Profil auswählen kannst.',
    [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Einstellungen',
        onPress: () => {
          void Linking.openSettings();
        },
      },
    ],
  );
}

/** Galerie-Zugriff (iOS/Android) — auf Web immer true. */
export async function ensureMediaLibraryAccess(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;

  if (current.canAskAgain) {
    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (requested.granted) return true;
    if (!requested.canAskAgain) showMediaLibraryDeniedAlert();
    return false;
  }

  showMediaLibraryDeniedAlert();
  return false;
}

/** Native Galerie / Dateiauswahl öffnen. */
export async function pickProfileMediaFromGallery(options?: {
  allowVideo?: boolean;
}): Promise<PickedProfileMedia | null> {
  const allowed = await ensureMediaLibraryAccess();
  if (!allowed) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: options?.allowVideo
      ? ImagePicker.MediaTypeOptions.All
      : ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    allowsMultipleSelection: false,
    quality: 0.85,
    videoMaxDuration: MAX_PROFILE_VIDEO_SEC,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    isVideo: asset.type === 'video',
  };
}

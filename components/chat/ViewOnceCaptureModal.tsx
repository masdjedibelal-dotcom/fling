import { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
  /** Galerie aus der Kamera heraus (WhatsApp: Miniatur unten links) */
  onOpenGallery?: () => void;
};

/** Kamera mit deutschen Aktionen statt iOS „Retake / Use Photo“. */
export function ViewOnceCaptureModal({ visible, onClose, onCapture, onOpenGallery }: Props) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!visible) setPreviewUri(null);
  }, [visible]);

  const takePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) setPreviewUri(photo.uri);
    } finally {
      setCapturing(false);
    }
  };

  const sendPhoto = () => {
    if (!previewUri) return;
    onCapture(previewUri);
    setPreviewUri(null);
    onClose();
  };

  if (!visible) return null;

  if (Platform.OS === 'web') return null;

  if (!permission) {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <View style={[styles.root, styles.centered]}>
          <ActivityIndicator color={FLING_COLORS.accent} />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible animationType="slide" onRequestClose={onClose}>
        <View style={[styles.root, styles.centered, { padding: 24 }]}>
          <Text style={styles.title}>Kamera-Zugriff</Text>
          <Text style={styles.subtitle}>
            Für Einmal-Fotos brauchen wir Zugriff auf die Kamera.
          </Text>
          <Pressable
            style={[styles.primaryBtn, { marginTop: 20 }]}
            onPress={() => void requestPermission()}
          >
            <Text style={styles.primaryBtnText}>Erlauben</Text>
          </Pressable>
          <Pressable style={[styles.ghostBtn, { marginTop: 12 }]} onPress={onClose}>
            <Text style={styles.ghostBtnText}>Abbrechen</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.fill}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.fill} contentFit="cover" />
        ) : (
          <CameraView ref={cameraRef} style={styles.fill} facing="back" />
        )}

        <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.toolbarLeft}>
            <Pressable onPress={onClose} hitSlop={12} style={styles.toolBtn}>
              <Text style={styles.ghostBtnText}>Abbrechen</Text>
            </Pressable>
            {!previewUri && onOpenGallery ? (
              <Pressable
                onPress={() => {
                  onClose();
                  onOpenGallery();
                }}
                hitSlop={10}
                style={styles.galleryBtn}
                accessibilityLabel="Aus Galerie"
              >
                <FlingIcon name="images" size={20} color="#fff" />
              </Pressable>
            ) : null}
          </View>

          {previewUri ? (
            <View style={styles.row}>
              <Pressable
                onPress={() => setPreviewUri(null)}
                hitSlop={8}
                style={styles.toolBtn}
              >
                <Text style={styles.ghostBtnText}>Wiederholen</Text>
              </Pressable>
              <Pressable onPress={sendPhoto} hitSlop={8} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Weiter</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => void takePhoto()}
              disabled={capturing}
              style={styles.shutter}
              accessibilityLabel="Foto aufnehmen"
            >
              {capturing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  root: {
    flex: 1,
    backgroundColor: FLING_COLORS.bg,
    paddingHorizontal: 20,
  },
  centered: { alignItems: 'center', justifyContent: 'center' },
  title: {
    color: '#fff',
    fontSize: FLING_TYPE.title,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FLING_TYPE.subhead,
    textAlign: 'center',
  },
  preview: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 12,
  },
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  galleryBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  toolBtn: { paddingVertical: 10, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  primaryBtn: {
    backgroundColor: FLING_COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: FLING_TYPE.subhead,
    fontFamily: 'Inter_600SemiBold',
  },
  ghostBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  ghostBtnText: {
    color: '#fff',
    fontSize: FLING_TYPE.subhead,
    fontFamily: 'Inter_500Medium',
  },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
  },
});

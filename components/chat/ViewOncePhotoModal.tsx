import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useScreenCaptureGuard } from '@/hooks/useScreenCaptureGuard';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

type Props = {
  visible: boolean;
  uri: string;
  onClose: () => void;
};

/** Vollbild-Einmalansicht — Screenshots blockiert solange offen */
export function ViewOncePhotoModal({ visible, uri, onClose }: Props) {
  useScreenCaptureGuard(visible);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <FlingIcon name="close" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.badge}>Einmalansicht</Text>
          <View style={styles.closeBtn} />
        </View>
        <Pressable style={styles.imageWrap} onPress={onClose}>
          <Image source={{ uri }} style={styles.image} contentFit="contain" />
        </Pressable>
        <Text style={styles.hint}>Screenshot blockiert · Tippe zum Schließen</Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    color: FLING_COLORS.gold,
    fontSize: FLING_TYPE.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  imageWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hint: {
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    fontSize: FLING_TYPE.caption,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
});

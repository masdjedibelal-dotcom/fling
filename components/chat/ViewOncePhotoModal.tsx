import { Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScreenCaptureGuard } from '@/hooks/useScreenCaptureGuard';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

type Props = {
  visible: boolean;
  uri: string;
  onClose: () => void;
};

/** Vollbild-Foto — Screenshots blockiert solange offen */
export function ViewOncePhotoModal({ visible, uri, onClose }: Props) {
  useScreenCaptureGuard(visible);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <FlingIcon name="close" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.badge}>Foto</Text>
          <View style={styles.closeBtn} />
        </View>

        <View style={styles.imageWrap}>
          <Image source={{ uri }} style={styles.image} contentFit="contain" />
        </View>

        <Pressable
          onPress={onClose}
          style={[styles.doneBtn, { marginBottom: Math.max(insets.bottom, 20) }]}
        >
          <Text style={styles.doneBtnText}>Schließen</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    color: FLING_COLORS.gold,
    fontSize: FLING_TYPE.caption,
    fontWeight: '700',
    letterSpacing: 1,
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
  doneBtn: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: FLING_COLORS.accent,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: FLING_TYPE.subhead,
    fontFamily: 'Inter_600SemiBold',
  },
});

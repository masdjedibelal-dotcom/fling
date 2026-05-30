import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

type Props = {
  visible: boolean;
  uri: string;
  onRetake: () => void;
  onSend: () => void;
  onClose: () => void;
};

/** Vorschau vor dem Senden — Galerie oder Kamera (WhatsApp „Foto senden“). */
export function ViewOncePhotoPreview({
  visible,
  uri,
  onRetake,
  onSend,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={onClose} hitSlop={12} style={styles.headerBtn}>
            <FlingIcon name="close" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.badge}>Foto</Text>
          <View style={styles.headerBtn} />
        </View>

        <Image source={{ uri }} style={styles.image} contentFit="contain" />

        <View style={[styles.toolbar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable onPress={onRetake} hitSlop={8} style={styles.ghostBtn}>
            <Text style={styles.ghostText}>Wiederholen</Text>
          </Pressable>
          <Pressable onPress={onSend} hitSlop={8} style={styles.sendBtn}>
            <Text style={styles.sendText}>Senden</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    color: FLING_COLORS.gold,
    fontSize: FLING_TYPE.caption,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  image: { flex: 1, width: '100%' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  ghostBtn: { paddingVertical: 12, paddingHorizontal: 8 },
  ghostText: {
    color: '#fff',
    fontSize: FLING_TYPE.subhead,
    fontFamily: 'Inter_500Medium',
  },
  sendBtn: {
    backgroundColor: FLING_COLORS.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  sendText: {
    color: '#fff',
    fontSize: FLING_TYPE.subhead,
    fontFamily: 'Inter_600SemiBold',
  },
});

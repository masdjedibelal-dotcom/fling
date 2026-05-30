import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet, BottomSheetPanel } from '@/components/ui/BottomSheet';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { MetaText, TitleText } from '@/components/ui/Typography';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
};

function OptionRow({
  icon,
  label,
  hint,
  onPress,
}: {
  icon: 'camera' | 'images';
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconWrap}>
        <FlingIcon name={icon} size={22} color={FLING_COLORS.fg} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <FlingIcon name="chev" size={16} color="rgba(255,255,255,0.35)" />
    </Pressable>
  );
}

/**
 * Quelle wählen — wie WhatsApp/Telegram: kompaktes Sheet statt direkt Kamera.
 */
export function PhotoSourceSheet({ visible, onClose, onCamera, onGallery }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} animationType="slide">
      <BottomSheetPanel maxHeightRatio={0.34}>
        <TitleText className="text-center mb-1">Foto senden</TitleText>
        <MetaText className="text-center text-fg-3 mb-4 normal-case">
          Wird einmal angezeigt · danach gelöscht
        </MetaText>

        <OptionRow
          icon="camera"
          label="Foto machen"
          hint="Kamera öffnen"
          onPress={onCamera}
        />
        <OptionRow
          icon="images"
          label="Aus Galerie"
          hint="Bestehendes Bild wählen"
          onPress={onGallery}
        />

        <Pressable onPress={onClose} style={styles.cancel} accessibilityRole="button">
          <Text style={styles.cancelText}>Abbrechen</Text>
        </Pressable>
      </BottomSheetPanel>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FLING_COLORS.line,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: {
    color: '#fff',
    fontSize: FLING_TYPE.body,
    fontFamily: 'Inter_600SemiBold',
  },
  rowHint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: FLING_TYPE.caption,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  cancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FLING_TYPE.subhead,
    fontFamily: 'Inter_600SemiBold',
  },
});

import {
  Modal,
  Platform,
  View,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FLING_COLORS, FLING_RADIUS } from '@/lib/designTokens';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade';
  /** Abstand von oben — Sheet endet unter Header / Titel */
  panelTopInset?: number;
};

/**
 * Bottom Sheet mit wine-getöntem Scrim.
 * Panel wächst nur mit Inhalt — nicht Vollbild (außer maxHeightRatio gesetzt).
 *
 * Web-Preview: kein RN-Modal (liegt außerhalb des scale-Transforms) — Overlay im Screen-Baum.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  animationType = 'slide',
  panelTopInset = 0,
}: BottomSheetProps) {
  const { height: screenH } = useAppDimensions();
  const sheetSlotHeight =
    panelTopInset > 0 ? Math.max(0, screenH - panelTopInset) : undefined;

  if (!visible) return null;

  const sheet = (
    <View style={[styles.root, panelTopInset > 0 && { paddingTop: panelTopInset }]}>
      <Pressable
        style={styles.scrimHit}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Schließen"
      />
      <View
        style={[
          styles.sheetSlot,
          sheetSlotHeight != null && { height: sheetSlotHeight, flex: 0 },
        ]}
        pointerEvents="box-none"
      >
        {children}
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return <View style={styles.webHost}>{sheet}</View>;
  }

  return (
    <Modal
      visible
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {sheet}
    </Modal>
  );
}

type BottomSheetPanelProps = {
  children: React.ReactNode;
  /** Primär-CTA unten fixiert (z. B. „Profile anzeigen“) */
  footer?: React.ReactNode;
  className?: string;
  withHandle?: boolean;
  /**
   * Max. Anteil der Bildschirmhöhe (z. B. 0.46 = kompaktes Filter-Sheet).
   * Ohne Angabe: nur so hoch wie Inhalt + Footer.
   */
  maxHeightRatio?: number;
  style?: StyleProp<ViewStyle>;
};

export function BottomSheetPanel({
  children,
  footer,
  className,
  withHandle = true,
  maxHeightRatio,
  style,
}: BottomSheetPanelProps) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useAppDimensions();
  const cappedHeight = maxHeightRatio
    ? Math.round(screenH * maxHeightRatio)
    : undefined;
  const fixedHeight = cappedHeight != null && footer ? cappedHeight : undefined;

  return (
    <View
      className={className}
      style={[
        styles.panel,
        fixedHeight != null
          ? { height: fixedHeight, maxHeight: fixedHeight, flex: 1, minHeight: 0 }
          : cappedHeight != null
            ? { maxHeight: cappedHeight }
            : null,
        { paddingBottom: Math.max(insets.bottom, 16) },
        style,
      ]}
    >
      {withHandle ? (
        <View className="w-10 h-1 rounded self-center mb-3 bg-white/20" />
      ) : null}

      {footer ? (
        <View style={styles.bodyWithFooter}>
          <View style={styles.contentTop}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: FLING_COLORS.overlayScrim,
  },
  scrimHit: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetSlot: {
    flex: 1,
    width: '100%',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    minHeight: 0,
  },
  panel: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: FLING_COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FLING_COLORS.line2,
    borderTopLeftRadius: FLING_RADIUS.xl,
    borderTopRightRadius: FLING_RADIUS.xl,
    paddingTop: 10,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  bodyWithFooter: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'space-between',
  },
  contentTop: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
  },
  footer: {
    flexShrink: 0,
    marginTop: 12,
    paddingTop: 4,
  },
});

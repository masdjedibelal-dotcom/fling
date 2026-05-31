import type { ReactNode } from 'react';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

type Props = {
  children: ReactNode;
  /** Standard: an — Tipp auf Hintergrund schließt die Tastatur. */
  enabled?: boolean;
};

/**
 * Schließt die Tastatur bei Tipp auf nicht-interaktive Bereiche.
 * Ergänzt ScrollViews mit `keyboardShouldPersistTaps="handled"`.
 */
export function KeyboardDismissView({ children, enabled = true }: Props) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
      accessibilityRole="none"
    >
      <View style={styles.fill} collapsable={false}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

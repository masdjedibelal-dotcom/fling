import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  WORDMARK_ON_SURFACE,
  WORDMARK_RULE_MIN_SIZE,
  type WordmarkSurface,
} from '@/lib/brand';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = {
  /** Schriftgröße in px (Hero 56, Title 48, Nav 28, Min 18) */
  size?: number;
  /** Hintergrund, auf dem die Marke liegt */
  surface?: WordmarkSurface;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Primäre Wortmarke: „fling“ · Fraunces Italic · Accent-Strich (App-Farbe).
 */
export function FlingWordmark({
  size = 48,
  surface = 'dark',
  style,
  accessibilityLabel = 'fling',
}: Props) {
  const { text, rule } = WORDMARK_ON_SURFACE[surface];
  const showRule = rule && size >= WORDMARK_RULE_MIN_SIZE;
  const ruleW = size * 2.15;
  const ruleH = Math.max(2, Math.round(size * 0.035));

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Text
        style={{
          fontFamily: 'Fraunces_400Regular_Italic',
          fontSize: size,
          lineHeight: Math.round(size * 1.08),
          letterSpacing: size * -0.03,
          color: text,
          includeFontPadding: false,
        }}
      >
        fling
      </Text>
      {showRule ? (
        <View
          style={{
            width: ruleW,
            height: ruleH,
            borderRadius: ruleH / 2,
            backgroundColor: FLING_COLORS.accent,
            marginTop: -Math.round(size * 0.14),
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'center',
  },
});

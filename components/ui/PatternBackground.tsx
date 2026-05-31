import { View, StyleSheet } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { accentRgba, FLING_COLORS } from '@/lib/designTokens';

const SPACING = 22;
const MAX_ROWS = 28;
const MAX_COLS = 18;

/** Raster + warme Glows — Fling.html `.frame::before` */
export function PatternBackground() {
  const { width, height } = useAppDimensions();
  const cols = Math.min(Math.ceil(width / SPACING), MAX_COLS);
  const rows = Math.min(Math.ceil(height / SPACING), MAX_ROWS);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: FLING_COLORS.bg }]} />
      <View
        style={{
          position: 'absolute',
          top: -height * 0.1,
          left: width * 0.5 - width * 0.6,
          width: width * 1.2,
          height: height * 0.7,
          borderRadius: 9999,
          backgroundColor: accentRgba(0.16),
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -height * 0.08,
          right: -width * 0.15,
          width: width * 0.9,
          height: height * 0.6,
          borderRadius: 9999,
          backgroundColor: 'rgba(120,20,60,0.18)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: -width * 0.2,
          width: width * 0.7,
          height: height * 0.5,
          borderRadius: 9999,
          backgroundColor: 'rgba(40,10,30,0.35)',
        }}
      />
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => (
          <View
            key={`${row}-${col}`}
            style={{
              position: 'absolute',
              left: col * SPACING + SPACING / 2,
              top: row * SPACING + SPACING / 2,
              width: 1.4,
              height: 1.4,
              borderRadius: 1,
              backgroundColor: 'rgba(255,255,255,0.04)',
            }}
          />
        )),
      )}
    </View>
  );
}

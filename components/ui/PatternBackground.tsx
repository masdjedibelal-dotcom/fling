import { View, StyleSheet, useWindowDimensions } from 'react-native';

const SPACING = 34;
const MAX_ROWS = 28;
const MAX_COLS = 18;

/** Dezentes Raster + warme Akzent-Glows — globaler App-Hintergrund */
export function PatternBackground() {
  const { width, height } = useWindowDimensions();
  const cols = Math.min(Math.ceil(width / SPACING), MAX_COLS);
  const rows = Math.min(Math.ceil(height / SPACING), MAX_ROWS);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0E0D0D' }]} />
      <View
        style={{
          position: 'absolute',
          top: height * 0.06,
          right: -width * 0.22,
          width: width * 0.85,
          height: width * 0.85,
          borderRadius: 9999,
          backgroundColor: '#D11537',
          opacity: 0.028,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: height * 0.12,
          left: -width * 0.28,
          width: width * 0.65,
          height: width * 0.65,
          borderRadius: 9999,
          backgroundColor: '#8b4518',
          opacity: 0.02,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: height * 0.42,
          left: width * 0.15,
          width: width * 0.5,
          height: width * 0.5,
          borderRadius: 9999,
          backgroundColor: '#D11537',
          opacity: 0.018,
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
              width: 1,
              height: 1,
              borderRadius: 1,
              backgroundColor: 'rgba(255,255,255,0.045)',
            }}
          />
        )),
      )}
    </View>
  );
}

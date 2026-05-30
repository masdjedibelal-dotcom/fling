import { Platform, Pressable, Switch, View, StyleSheet } from 'react-native';
import { FLING_COLORS } from '@/lib/designTokens';

const TRACK_W = 51;
const TRACK_H = 31;
const THUMB = 27;
const PAD = 2;

/** iOS/Android: natives Switch — Rot an, Schwarz aus (kein System-Grün). Web: eigener Toggle. */
export function FlingSwitch({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  if (Platform.OS === 'web') {
    return (
      <Pressable
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        style={[
          styles.webTrack,
          value ? styles.webTrackOn : styles.webTrackOff,
          disabled && styles.disabled,
        ]}
      >
        <View
          style={[
            styles.webThumb,
            value ? styles.webThumbOn : styles.webThumbOff,
          ]}
        />
      </Pressable>
    );
  }

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: FLING_COLORS.bg2,
        true: FLING_COLORS.accent,
      }}
      thumbColor={value ? FLING_COLORS.fg : 'rgba(255,255,255,0.45)'}
      ios_backgroundColor={FLING_COLORS.bg2}
    />
  );
}

const styles = StyleSheet.create({
  webTrack: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    padding: PAD,
    justifyContent: 'center',
  },
  webTrackOff: {
    backgroundColor: FLING_COLORS.bg2,
    borderWidth: 1,
    borderColor: FLING_COLORS.line2,
  },
  webTrackOn: {
    backgroundColor: FLING_COLORS.accent,
    borderWidth: 1,
    borderColor: FLING_COLORS.accentD,
  },
  webThumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: FLING_COLORS.fg,
  },
  webThumbOff: {
    alignSelf: 'flex-start',
  },
  webThumbOn: {
    alignSelf: 'flex-end',
  },
  disabled: {
    opacity: 0.45,
  },
});

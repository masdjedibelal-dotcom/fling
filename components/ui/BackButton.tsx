import { StyleSheet } from 'react-native';
import { PressableScale } from '@/components/ui/PressableScale';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { safeBack } from '@/lib/navigation';

export function BackButton({
  onPress,
  fallbackHref = '/(tabs)',
}: {
  onPress?: () => void;
  fallbackHref?: string;
}) {
  return (
    <PressableScale
      onPress={onPress ?? (() => safeBack(fallbackHref))}
      hitSlop={8}
      style={styles.btn}
      accessibilityLabel="Zurück"
      accessibilityRole="button"
      haptic="light"
    >
      <FlingIcon name="back" size={20} color="#fff" />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    zIndex: 200,
    elevation: 200,
  },
});

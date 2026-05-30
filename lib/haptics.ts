import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticStyle = 'light' | 'medium' | 'success' | 'warning';

export function triggerHaptic(style: HapticStyle = 'light'): void {
  if (Platform.OS === 'web') return;
  switch (style) {
    case 'light':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'success':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
  }
}

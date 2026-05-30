import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';
import { useAppLayoutSize } from '@/components/app/AppLayoutProvider';

/** Layout-Maße — im Web-Preview die Smartphone-Fläche, sonst Fenster. */
export function useAppDimensions() {
  const window = useWindowDimensions();
  const preview = useAppLayoutSize();

  if (Platform.OS === 'web' && preview) {
    return {
      ...window,
      width: preview.width,
      height: Math.max(preview.height, window.height),
    };
  }

  return window;
}

import { usePreventScreenCapture } from 'expo-screen-capture';

/** Screenshots & Screenrecording blockieren — gilt solange der Screen gemountet ist. */
export function useDiscreetScreen() {
  usePreventScreenCapture();
}

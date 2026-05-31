import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

/**
 * Tastatur sichtbar + unterer Inset (Web: visualViewport, Native: Keyboard-Events).
 */
export function useKeyboardVisible() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardInsetBottom, setKeyboardInsetBottom] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      const vv = window.visualViewport;
      if (!vv) return;

      const update = () => {
        const gap = Math.max(0, window.innerHeight - vv.height);
        const open = gap > 60;
        setKeyboardVisible(open);
        setKeyboardInsetBottom(open ? gap : 0);
      };

      update();
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
      return () => {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      };
    }

    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, (e) => {
      setKeyboardVisible(true);
      const windowH = Dimensions.get('window').height;
      const inset = Math.max(0, windowH - e.endCoordinates.screenY);
      setKeyboardInsetBottom(inset > 0 ? inset : e.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvt, () => {
      setKeyboardVisible(false);
      setKeyboardInsetBottom(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onInputFocus = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    setKeyboardVisible(true);
    const syncInset = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      const gap = Math.max(0, window.innerHeight - vv.height);
      setKeyboardInsetBottom(gap > 20 ? gap : 0);
    };
    syncInset();
    requestAnimationFrame(syncInset);
    setTimeout(syncInset, 120);
    setTimeout(syncInset, 320);
  }, []);

  const onInputBlur = useCallback(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    setTimeout(() => {
      const vv = window.visualViewport;
      const gap = vv ? Math.max(0, window.innerHeight - vv.height) : 0;
      if (gap < 60) {
        setKeyboardVisible(false);
        setKeyboardInsetBottom(0);
      }
    }, 150);
  }, []);

  return {
    keyboardVisible,
    keyboardInsetBottom,
    onInputFocus,
    onInputBlur,
  };
}

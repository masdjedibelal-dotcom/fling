import { forwardRef } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { FLING_SCROLL_KEYBOARD_PROPS } from '@/lib/keyboard';

/** ScrollView mit Tastatur: Tipp außerhalb der Inputs schließt sie; Wischen zum Schließen. */
export const FlingScrollView = forwardRef<ScrollView, ScrollViewProps>(function FlingScrollView(
  { keyboardShouldPersistTaps, keyboardDismissMode, ...props },
  ref,
) {
  return (
    <ScrollView
      ref={ref}
      {...FLING_SCROLL_KEYBOARD_PROPS}
      keyboardShouldPersistTaps={
        keyboardShouldPersistTaps ?? FLING_SCROLL_KEYBOARD_PROPS.keyboardShouldPersistTaps
      }
      keyboardDismissMode={
        keyboardDismissMode ?? FLING_SCROLL_KEYBOARD_PROPS.keyboardDismissMode
      }
      {...props}
    />
  );
});

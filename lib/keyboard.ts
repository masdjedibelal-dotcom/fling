import { Keyboard } from 'react-native';

/** Tastatur schließen (z. B. Tipp außerhalb von Eingabefeldern). */
export function dismissKeyboard() {
  Keyboard.dismiss();
}

/** Standard-ScrollView-Props: Tipp auf freie Fläche schließt die Tastatur. */
export const FLING_SCROLL_KEYBOARD_PROPS = {
  keyboardShouldPersistTaps: 'handled' as const,
  keyboardDismissMode: 'on-drag' as const,
};

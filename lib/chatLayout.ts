/** Abstand Eingabezeile ↔ Tastatur (WhatsApp-ähnlich) */
export const KEYBOARD_COMPOSER_GAP = 10;

/** Gesamter Lift für Chat-Bereich (Nachrichten + Composer) */
export function chatKeyboardLift(
  keyboardVisible: boolean,
  keyboardInsetBottom: number,
): number {
  if (!keyboardVisible || keyboardInsetBottom <= 0) return 0;
  return keyboardInsetBottom + KEYBOARD_COMPOSER_GAP;
}

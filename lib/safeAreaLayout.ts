import { FLING_TOUCH } from '@/lib/designTokens';

/** Abstand unter der Safe Area bis zur Header-Zeile */
export const SAFE_TOP_CONTENT_GAP = 10;

/** Höhe der interaktiven Header-Zeile (ohne Statusleiste) */
export const HEADER_ROW_HEIGHT = FLING_TOUCH.min;

export const HEADER_ROW_PADDING_BOTTOM = 12;

/** Gesamthöhe: Statusleiste + Header (für Sheets unter dem Header) */
export function getChromeHeaderHeight(topInset: number): number {
  return (
    topInset +
    SAFE_TOP_CONTENT_GAP +
    HEADER_ROW_HEIGHT +
    HEADER_ROW_PADDING_BOTTOM
  );
}

/** Pick-FAB — Layout & Freihaltezone für Touch (kein Konflikt mit Foto-Taps / Feed-Scroll) */

export const PICK_FAB_SIZE = 64;
export const PICK_FAB_RIGHT = 16;
export const PICK_FAB_EXTRA_BOTTOM = 20;

/** Unterer Bereich frei für Bio, Tags, Pick — Foto-Tap-Zonen enden darüber */
export const BOTTOM_META_RESERVE = 200;

export function getPickFabInsets(bottomSafeInset: number) {
  const bottom = Math.max(bottomSafeInset, 12) + 8;
  const reserveBottom = bottom + PICK_FAB_SIZE + PICK_FAB_EXTRA_BOTTOM;
  const reserveRight = PICK_FAB_RIGHT + PICK_FAB_SIZE + 12;
  const photoTapBottom = Math.max(reserveBottom, BOTTOM_META_RESERVE);
  return { bottom, reserveBottom, reserveRight, photoTapBottom };
}

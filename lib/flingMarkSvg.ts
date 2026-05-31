import { FLING_ACCENT, FLING_COLORS } from '@/lib/designTokens';

/** Legacy F-Tile (deprecated — Wortmarke ist Standard) */

export const FLING_MARK_VIEWBOX = 80;
export const FLING_MARK_TILE_RADIUS = 18;

/** Crimson F with angled spark cuts on horizontal arms */
export const FLING_MARK_F_PATH =
  'M18 14H55L62 21H31V37H51L58 44H31V66H18V14Z';

export const FLING_MARK_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 80 80">
  <defs>
    <linearGradient id="fling-bg" x1="40" y1="0" x2="40" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4a1824"/>
      <stop offset="42%" stop-color="#221418"/>
      <stop offset="100%" stop-color="${FLING_COLORS.bg}"/>
    </linearGradient>
  </defs>
  <rect width="80" height="80" rx="${FLING_MARK_TILE_RADIUS}" fill="url(#fling-bg)"/>
  <path fill="${FLING_ACCENT}" d="${FLING_MARK_F_PATH}"/>
</svg>`;

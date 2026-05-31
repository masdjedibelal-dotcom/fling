import { FLING_ACCENT, FLING_COLORS } from '@/lib/designTokens';

/** App-Icon / Tile als SVG-String (Wortmarke auf App-Hintergrund) */

export const FLING_MARK_VIEWBOX = 80;
export const FLING_MARK_TILE_RADIUS = 18;

export const FLING_MARK_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="${FLING_MARK_TILE_RADIUS}" fill="${FLING_COLORS.bg}"/>
  <text x="40" y="44" text-anchor="middle" font-family="Georgia, serif" font-weight="400" font-style="italic" font-size="22" letter-spacing="-0.6" fill="#FFFFFF">fling</text>
  <rect x="26" y="47" width="28" height="1.2" rx="0.4" fill="${FLING_ACCENT}"/>
</svg>`;

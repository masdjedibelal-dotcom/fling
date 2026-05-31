import { FLING_ACCENT, FLING_COLORS } from '@/lib/designTokens';

/**
 * Wortmarke — Farben aus FLING_COLORS (eine Palette mit der App).
 */

export const FLING_BRAND = {
  accent: FLING_ACCENT,
  accentDeep: FLING_COLORS.accentD,
  appBg: FLING_COLORS.bg,
  card: FLING_COLORS.card,
  fg: FLING_COLORS.fg,
} as const;

/** App-Icon: Wortmarke auf App-Hintergrund */
export const FLING_APP_ICON_BG = FLING_COLORS.bg;

export type WordmarkSurface = 'dark' | 'card' | 'accent' | 'light';

/** Text- und Strich je Fläche in der App */
export const WORDMARK_ON_SURFACE: Record<
  WordmarkSurface,
  { text: string; rule: boolean }
> = {
  /** Standard: Welcome, Auth auf #120A0C */
  dark: { text: FLING_COLORS.fg, rule: true },
  /** Karten, Modals */
  card: { text: FLING_COLORS.fg, rule: true },
  /** Volle Accent-Fläche (z. B. Button-Hintergrund) — ohne Strich */
  accent: { text: FLING_COLORS.fg, rule: false },
  /** Helle Flächen (selten) */
  light: { text: FLING_COLORS.ink, rule: true },
};

export const WORDMARK_RULE_MIN_SIZE = 28;

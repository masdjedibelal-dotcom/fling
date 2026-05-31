/** Fling Design System — Premium Hookup, Wein-Schwarz + Accent */
export const FLING_ICON_SIZE = 24;

/**
 * Typo an iOS (SF Pro) angelehnt — Body 17pt, Footnote 13pt, Large Title 34pt.
 * @see https://developer.apple.com/design/human-interface-guidelines/typography
 */
export const FLING_TYPE = {
  caption2: 11,
  caption: 13,
  meta: 13,
  subhead: 15,
  callout: 16,
  body: 17,
  bodyLarge: 17,
  label: 17,
  title: 22,
  screenTitle: 28,
  display: 32,
  displayHero: 34,
  welcome: 56,
  /** Große Ziffernfelder (Geburtsdatum, OTP) */
  displayInput: 24,
} as const;

/** TextInput / TextArea — gleiche Größe wie iOS Body */
export const FLING_INPUT_TEXT = { fontSize: FLING_TYPE.body } as const;

/** Mindest-Touchfläche 44×44pt (Apple HIG) */
export const FLING_TOUCH = {
  min: 44,
  bar: 44,
  icon: 28,
} as const;

export const FLING_SPACE = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FLING_RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  bubble: 18,
  bubbleTail: 4,
  pill: 999,
} as const;

/** Einzige Accent-Quelle — Wortmarke, Glows, Icons, Tailwind */
export const FLING_ACCENT = '#E11539';

function accentRgb(hex: string = FLING_ACCENT) {
  const n = hex.replace('#', '');
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

/** Transparentes Accent — immer aus FLING_ACCENT abgeleitet */
export function accentRgba(alpha: number, hex: string = FLING_ACCENT): string {
  const { r, g, b } = accentRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const FLING_COLORS = {
  bg: '#120A0C',
  bg2: '#1a0f12',
  surface: '#1c1114',
  card: '#221418',
  card2: '#2a181d',
  paper: '#FFFFFF',
  ink: '#120A0C',
  accent: FLING_ACCENT,
  accentD: '#a30f29',
  accent2: '#ff5870',
  accentGlow: accentRgba(0.45),
  fg: '#FFFFFF',
  fg2: 'rgba(255,255,255,0.72)',
  fg3: 'rgba(255,255,255,0.52)',
  fg4: 'rgba(255,255,255,0.36)',
  fgMuted: 'rgba(255,255,255,0.32)',
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.14)',
  green: '#00e07a',
  greenD: '#00a85c',
  gold: '#f0c040',
  overlayFade: 'rgba(18,10,12,0.99)',
  overlayScrim: 'rgba(18,10,12,0.82)',
  tileScrim: 'rgba(40,8,20,0.45)',
  tileGlow: accentRgba(0.12),
} as const;

export const FLING_BUTTON_GRADIENT = [
  FLING_COLORS.accent2,
  FLING_COLORS.accent,
  FLING_COLORS.accentD,
] as const;

export function formatChatTimerRemaining(hours: number, minutes: number): string {
  if (hours < 1) return `Noch ${minutes} Min`;
  if (hours === 1) return 'Noch 1 Stunde';
  return `Noch ${hours} Std`;
}

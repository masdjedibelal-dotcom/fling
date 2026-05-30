/** Fine-Line Icons aus Fling.html / Graphics v2 — 1.5px, viewBox 24×24 */

export type FineIconPath =
  | { kind: 'path'; d: string; filled?: boolean }
  | { kind: 'circle'; cx: number; cy: number; r: number; filled?: boolean };

export const FINE_LINE_ICONS = {
  home: [
    {
      kind: 'path',
      d: 'M4 11 L12 4 L20 11 M6 9.5 V19 A1 1 0 0 0 7 20 H17 A1 1 0 0 0 18 19 V9.5',
    },
  ],
  pick: [
    {
      kind: 'path',
      d: 'M12 20 C 7.5 16.5 4 13.2 4 9.5 A 4 4 0 0 1 12 7.2 A 4 4 0 0 1 20 9.5 C 20 13.2 16.5 16.5 12 20 Z',
    },
    { kind: 'circle', cx: 12, cy: 11, r: 1.4, filled: true },
  ],
  profile: [
    { kind: 'path', d: 'M12 8.5 A3.6 3.6 0 1 0 12 15.7 A3.6 3.6 0 1 0 12 8.5' },
    { kind: 'path', d: 'M5.5 20 C 5.5 16 8 13.5 12 13.5 C 16 13.5 18.5 16 18.5 20' },
  ],
  chat: [
    {
      kind: 'path',
      d: 'M4 6.5 A1.5 1.5 0 0 1 5.5 5 H18.5 A1.5 1.5 0 0 1 20 6.5 V15 A1.5 1.5 0 0 1 18.5 16.5 H10 L5.5 20 V16.5 A1.5 1.5 0 0 1 4 15 Z',
    },
  ],
  heart: [
    {
      kind: 'path',
      d: 'M12 20 C 7.5 16.5 4 13.2 4 9.5 A 4 4 0 0 1 12 7.2 A 4 4 0 0 1 20 9.5 C 20 13.2 16.5 16.5 12 20 Z',
      filled: true,
    },
  ],
  search: [
    { kind: 'path', d: 'M11 4.7 A6.3 6.3 0 1 0 11 17.3 A6.3 6.3 0 1 0 11 4.7' },
    { kind: 'path', d: 'M15.6 15.6 L20 20' },
  ],
  camera: [
    {
      kind: 'path',
      d: 'M4 9 A1.6 1.6 0 0 1 5.6 7.4 H8 L9.3 5.2 H14.7 L16 7.4 H18.4 A1.6 1.6 0 0 1 20 9 V17.4 A1.6 1.6 0 0 1 18.4 19 H5.6 A1.6 1.6 0 0 1 4 17.4 Z',
    },
    { kind: 'path', d: 'M12 9.8 A3.2 3.2 0 1 0 12 16.2 A3.2 3.2 0 1 0 12 9.8' },
  ],
  bell: [
    {
      kind: 'path',
      d: 'M7 17 V10.5 A5 5 0 0 1 17 10.5 V17 L18.5 18.5 H5.5 Z M10 18.5 A2 2 0 0 0 14 18.5',
    },
  ],
  lock: [
    { kind: 'path', d: 'M5.5 10.5 H18.5 A2.4 2.4 0 0 1 20.9 12.9 V20 A2.4 2.4 0 0 1 18.5 22.4 H5.5 A2.4 2.4 0 0 1 3.1 20 V12.9 A2.4 2.4 0 0 1 5.5 10.5 Z' },
    { kind: 'path', d: 'M8.2 10.5 V8 A3.8 3.8 0 0 1 15.8 8 V10.5' },
  ],
  shield: [
    {
      kind: 'path',
      d: 'M12 3.5 L19 6 V11.5 C 19 16 16 19 12 20.5 C 8 19 5 16 5 11.5 V6 Z',
    },
    { kind: 'path', d: 'M9.2 12 L11.2 14 L15 9.8' },
  ],
  verified: [
    {
      kind: 'path',
      d: 'M12 3 L14 5.2 L17 5 L16.8 8 L19 10 L16.8 12 L17 15 L14 14.8 L12 17 L10 14.8 L7 15 L7.2 12 L5 10 L7.2 8 L7 5 L10 5.2 Z',
    },
    { kind: 'path', d: 'M9.2 10 L11 11.8 L14.6 8' },
  ],
  close: [{ kind: 'path', d: 'M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5' }],
  timer: [
    { kind: 'path', d: 'M12 3.8 A8.2 8.2 0 1 0 12 20.2 A8.2 8.2 0 1 0 12 3.8' },
    { kind: 'path', d: 'M12 7.5 V12 L15 13.8' },
  ],
  back: [{ kind: 'path', d: 'M14.5 5.5 L8 12 L14.5 18.5' }],
  chev: [{ kind: 'path', d: 'M9.5 5.5 L16 12 L9.5 18.5' }],
  arrow: [{ kind: 'path', d: 'M5 12 H19 M13 6 L19 12 L13 18' }],
  /** Papierflieger — Nachricht senden */
  send: [{ kind: 'path', d: 'M4.5 19.5 L19.5 12 L4.5 4.5 L4.5 10.5 L13 12 L4.5 13.5 Z', filled: true }],
  pin: [
    {
      kind: 'path',
      d: 'M12 21 C 8 17 5.5 13.5 5.5 10 A 6.5 6.5 0 0 1 18.5 10 C 18.5 13.5 16 17 12 21 Z',
    },
    { kind: 'path', d: 'M12 7.7 A2.3 2.3 0 1 0 12 12.3 A2.3 2.3 0 1 0 12 7.7' },
  ],
  spark: [
    {
      kind: 'path',
      d: 'M12 3 C 12.6 7.5 14.5 9.4 19 10 C 14.5 10.6 12.6 12.5 12 17 C 11.4 12.5 9.5 10.6 5 10 C 9.5 9.4 11.4 7.5 12 3 Z',
    },
  ],
  edit: [
    { kind: 'path', d: 'M15.5 5 L19 8.5 L9 18.5 H5.5 V15 Z M13.5 7 L17 10.5' },
  ],
  filter: [{ kind: 'path', d: 'M4.5 7 H19.5 M7.5 12 H16.5 M10 17 H14' }],
  list: [
    { kind: 'path', d: 'M5 7 H19 M5 12 H19 M5 17 H19' },
  ],
  grid: [
    { kind: 'path', d: 'M5 5 H10 V10 H5 Z M14 5 H19 V10 H14 Z M5 14 H10 V19 H5 Z M14 14 H19 V19 H14 Z' },
  ],
  plus: [
    { kind: 'path', d: 'M12 5 V19 M5 12 H19' },
  ],
  images: [
    { kind: 'path', d: 'M4 5 H20 A2 2 0 0 1 22 7 V17 A2 2 0 0 1 20 19 H4 A2 2 0 0 1 2 17 V7 A2 2 0 0 1 4 5 Z' },
    { kind: 'path', d: 'M9 10 A1.6 1.6 0 1 0 9 13.2 A1.6 1.6 0 1 0 9 10' },
    {
      kind: 'path',
      d: 'M5 17 L10 12.5 L14 16 L17 13 L19 15',
    },
  ],
  warn: [
    { kind: 'path', d: 'M12 4 L20.5 19 H3.5 Z' },
    { kind: 'path', d: 'M12 10 V14 M12 16.5 V16.6' },
  ],
  check: [{ kind: 'path', d: 'M6 12 L10 16 L18 8' }],
  mic: [
    {
      kind: 'path',
      d: 'M12 4.2 A3.2 3.2 0 0 1 12 10.6 A3.2 3.2 0 0 1 12 4.2',
    },
    { kind: 'path', d: 'M8.5 10.5 V12 A3.5 3.5 0 0 0 15.5 12 V10.5' },
    { kind: 'path', d: 'M12 15.5 V18.5 M9.5 18.5 H14.5' },
  ],
  smile: [
    { kind: 'path', d: 'M12 3.8 A8.2 8.2 0 1 0 12 20.2 A8.2 8.2 0 1 0 12 3.8' },
    { kind: 'path', d: 'M8.5 13.5 C9.5 15 14.5 15 15.5 13.5' },
    { kind: 'path', d: 'M9.2 10.2 A0.9 0.9 0 1 0 9.2 12 A0.9 0.9 0 1 0 9.2 10.2' },
    { kind: 'path', d: 'M14.8 10.2 A0.9 0.9 0 1 0 14.8 12 A0.9 0.9 0 1 0 14.8 10.2' },
  ],
} as const satisfies Record<string, FineIconPath[]>;

export type FineIconName = keyof typeof FINE_LINE_ICONS;

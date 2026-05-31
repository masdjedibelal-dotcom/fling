/**
 * Öffentliche Demo-Clips (Mixkit blockiert Hotlinking mit 403).
 * Prefix `video:` wird in profileMedia.ts gesetzt.
 */
export const DEMO_VIDEO_FLOWER =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

export const DEMO_VIDEO_BBB = 'https://www.w3schools.com/html/mov_bbb.mp4';

export function demoVideoUri(url: string): string {
  return `video:${url}`;
}

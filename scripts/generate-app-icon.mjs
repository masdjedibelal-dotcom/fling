/**
 * Generiert alle Marken-PNGs aus SVG (Wortmarke, kein altes F-Logo).
 * Run: npm run icons
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assets = join(root, 'assets');

/** Sync mit lib/designTokens.ts */
const FLING_ACCENT = '#E11539';
const FLING_BG = '#120A0C';
const FLING_CARD = '#221418';

function hexRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function solidPng(width, height, hex) {
  const { r, g, b } = hexRgb(hex);
  return sharp({
    create: { width, height, channels: 4, background: { r, g, b, alpha: 1 } },
  }).png();
}

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp nicht installiert — npm i -D sharp && npm run icons');
  process.exit(0);
}

const iconAppSvg = readFileSync(join(assets, 'icon-app.svg'), 'utf8');
const wordmarkSvg = readFileSync(join(assets, 'wordmark-only.svg'), 'utf8');
const splashScreenSvg = readFileSync(join(assets, 'splash-screen.svg'), 'utf8');
const wordmarkDarkSvg = readFileSync(join(assets, 'fling-wordmark-dark.svg'), 'utf8');

const png1024 = await sharp(Buffer.from(iconAppSvg)).resize(1024, 1024).png().toBuffer();

writeFileSync(join(assets, 'icon.png'), png1024);
writeFileSync(join(assets, 'icon-master.svg'), iconAppSvg);

// Splash: nur Wortmarke (transparent) — liegt auf backgroundColor in app.json
const splashWordmark = await sharp(Buffer.from(wordmarkSvg))
  .resize(640, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
writeFileSync(join(assets, 'splash-icon.png'), splashWordmark);

// Vollbild-Splash (iOS/Android native nach prebuild)
writeFileSync(
  join(assets, 'splash.png'),
  await sharp(Buffer.from(splashScreenSvg)).resize(1284, 2778).png().toBuffer(),
);

// Android: Foreground = Wortmarke auf Transparent (Hintergrund separat)
writeFileSync(
  join(assets, 'android-icon-foreground.png'),
  await sharp(Buffer.from(wordmarkSvg))
    .resize(432, 432, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer(),
);

writeFileSync(
  join(assets, 'android-icon-background.png'),
  await solidPng(1024, 1024, FLING_BG).toBuffer(),
);

writeFileSync(
  join(assets, 'favicon.png'),
  await sharp(Buffer.from(wordmarkSvg)).resize(48, 48, { fit: 'contain' }).png().toBuffer(),
);

// Marketing-Raster: Wortmarke auf App-Hintergründen
async function wordmarkOnBg(bgHex, outName, width = 720, height = 320) {
  const bg = await solidPng(width, height, bgHex).toBuffer();
  const mark = await sharp(Buffer.from(wordmarkDarkSvg))
    .resize(Math.round(width * 0.72), Math.round(height * 0.55), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  writeFileSync(
    join(assets, outName),
    await sharp(bg)
      .composite([{ input: mark, gravity: 'center' }])
      .png()
      .toBuffer(),
  );
}

await wordmarkOnBg(FLING_BG, 'fling-wordmark-on-dark.png');
await wordmarkOnBg(FLING_CARD, 'fling-wordmark-on-bone.png');

console.log(
  [
    'Marken-Assets generiert:',
    'icon.png, splash.png, splash-icon.png (Wortmarke)',
    'android-icon-foreground/background.png, favicon.png',
    'fling-wordmark-on-dark.png, fling-wordmark-on-bone.png',
  ].join('\n  '),
);

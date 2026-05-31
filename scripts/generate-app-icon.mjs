/**
 * Generiert alle Marken-PNGs aus fling-wordmark-dark.svg (Wortmarke, kein F-Tile).
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
const ICON_RADIUS = 224;

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

function roundedAppIconBg(size, radius, hex) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${hex}"/>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function wordmarkPng(wordmarkSvg, width, height) {
  return sharp(Buffer.from(wordmarkSvg))
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function wordmarkOnBg(bgHex, outName, canvasW, canvasH, markScale = 0.72) {
  const bg = await solidPng(canvasW, canvasH, bgHex).toBuffer();
  const mark = await wordmarkPng(
    wordmarkSvg,
    Math.round(canvasW * markScale),
    Math.round(canvasH * markScale),
  );
  writeFileSync(
    join(assets, outName),
    await sharp(bg).composite([{ input: mark, gravity: 'center' }]).png().toBuffer(),
  );
}

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp nicht installiert — npm i -D sharp && npm run icons');
  process.exit(0);
}

const wordmarkSvg = readFileSync(join(assets, 'fling-wordmark-dark.svg'), 'utf8');

// Splash: transparente Wortmarke (Expo: contain + backgroundColor)
const splashWordmark = await wordmarkPng(wordmarkSvg, 640, 256);
writeFileSync(join(assets, 'splash-icon.png'), splashWordmark);

// Vollbild-Splash (Fallback / Stores) — gleiche Marke wie in der App
await wordmarkOnBg(FLING_BG, 'splash.png', 1284, 2778, 0.42);

// App-Icon (iOS / Store)
writeFileSync(
  join(assets, 'icon.png'),
  await sharp(await roundedAppIconBg(1024, ICON_RADIUS, FLING_BG))
    .composite([
      {
        input: await wordmarkPng(wordmarkSvg, 620, 248),
        gravity: 'center',
      },
    ])
    .png()
    .toBuffer(),
);

// Android adaptive: Foreground = Wortmarke
writeFileSync(
  join(assets, 'android-icon-foreground.png'),
  await wordmarkPng(wordmarkSvg, 432, 432),
);

writeFileSync(
  join(assets, 'android-icon-background.png'),
  await solidPng(1024, 1024, FLING_BG).toBuffer(),
);

writeFileSync(
  join(assets, 'favicon.png'),
  await wordmarkPng(wordmarkSvg, 48, 48),
);

await wordmarkOnBg(FLING_BG, 'fling-wordmark-on-dark.png', 720, 320);
await wordmarkOnBg(FLING_CARD, 'fling-wordmark-on-bone.png', 720, 320);

// Referenz-SVGs an aktuelle Wortmarke anbinden (nur Doku / manuelle Vorschau)
writeFileSync(
  join(assets, 'icon-app.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="${ICON_RADIUS}" fill="${FLING_BG}"/>
  <!-- Generiert via npm run icons aus fling-wordmark-dark.svg -->
</svg>`,
);
writeFileSync(
  join(assets, 'splash-screen.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="1284" height="2778" viewBox="0 0 1284 2778">
  <rect width="1284" height="2778" fill="${FLING_BG}"/>
  <!-- Generiert via npm run icons aus fling-wordmark-dark.svg -->
</svg>`,
);
writeFileSync(join(assets, 'icon-master.svg'), readFileSync(join(assets, 'icon-app.svg'), 'utf8'));

console.log(
  [
    'Marken-Assets generiert (Quelle: fling-wordmark-dark.svg):',
    'icon.png, splash.png, splash-icon.png',
    'android-icon-foreground/background.png, favicon.png',
    'fling-wordmark-on-dark.png, fling-wordmark-on-bone.png',
  ].join('\n  '),
);

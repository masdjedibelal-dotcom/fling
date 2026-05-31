/**
 * Generiert App-Icons aus icon-app.svg (Wortmarke auf Bone).
 * Run: node scripts/generate-app-icon.mjs
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

const SVG = readFileSync(join(assets, 'icon-app.svg'), 'utf8');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp nicht installiert — icon-app.svg ist aktuell.');
  console.log('Optional: npm i -D sharp && node scripts/generate-app-icon.mjs');
  process.exit(0);
}

const png1024 = await sharp(Buffer.from(SVG)).resize(1024, 1024).png().toBuffer();
writeFileSync(join(assets, 'icon.png'), png1024);
writeFileSync(join(assets, 'splash-icon.png'), await sharp(png1024).resize(512, 512).png().toBuffer());
writeFileSync(
  join(assets, 'android-icon-foreground.png'),
  await sharp(png1024).resize(432, 432).png().toBuffer(),
);
writeFileSync(
  join(assets, 'favicon.png'),
  await sharp(png1024).resize(48, 48).png().toBuffer(),
);
writeFileSync(
  join(assets, 'android-icon-background.png'),
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: {
        r: parseInt(FLING_BG.slice(1, 3), 16),
        g: parseInt(FLING_BG.slice(3, 5), 16),
        b: parseInt(FLING_BG.slice(5, 7), 16),
        alpha: 1,
      },
    },
  })
    .png()
    .toBuffer(),
);

console.log(
  'Icons generiert: icon.png, splash-icon.png, android-icon-foreground.png, android-icon-background.png, favicon.png',
);

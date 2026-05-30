/**
 * Generiert App-Icons aus icon-master.svg (Funken-Kerbe • dunkel).
 * Run: node scripts/generate-app-icon.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assets = join(root, 'assets');

const SVG = readFileSync(join(assets, 'icon-master.svg'), 'utf8');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp nicht installiert — icon-master.svg ist aktuell.');
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
      background: { r: 18, g: 10, b: 12, alpha: 1 },
    },
  })
    .png()
    .toBuffer(),
);

console.log(
  'Icons generiert: icon.png, splash-icon.png, android-icon-foreground.png, android-icon-background.png, favicon.png',
);

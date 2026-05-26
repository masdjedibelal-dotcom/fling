/**
 * Generiert App-Icons aus FlingMark-SVG.
 * Run: node scripts/generate-app-icon.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const assets = join(root, 'assets');

const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 80 80">
  <defs>
    <mask id="f" maskUnits="userSpaceOnUse" x="0" y="0" width="80" height="80">
      <rect width="80" height="80" fill="white"/>
      <rect x="18" y="14" width="13" height="52" rx="1.5" fill="black"/>
      <rect x="18" y="14" width="42" height="12" rx="1.5" fill="black"/>
      <rect x="18" y="37" width="32" height="11" rx="1.5" fill="black"/>
    </mask>
  </defs>
  <rect width="80" height="80" rx="18" fill="#D11537" mask="url(#f)"/>
</svg>`;

writeFileSync(join(assets, 'icon-master.svg'), SVG);

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('sharp nicht installiert — nur icon-master.svg geschrieben.');
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

console.log('Icons generiert: icon.png, splash-icon.png, android-icon-foreground.png, favicon.png');

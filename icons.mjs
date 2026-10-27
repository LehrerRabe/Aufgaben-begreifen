/* Erzeugt die App-Symbole aus logo.js.  Aufruf: node icons.mjs   (braucht das Paket "sharp")
   Mit "node icons.mjs muster" entsteht muster.png mit allen drei Entwürfen nebeneinander. */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { iconSvg, ENTWURF } from './logo.js';

if (process.argv[2] === 'muster') {
  const teile = [];
  for (const e of ['hand', 'treppe', 'plus']) {
    teile.push({ input: await sharp(Buffer.from(iconSvg(e))).resize(300, 300).png().toBuffer(), left: 20 + teile.length * 330, top: 20 });
  }
  await sharp({ create: { width: 1010, height: 340, channels: 4, background: '#ffffff' } }).composite(teile).png().toFile('muster.png');
} else {
  writeFileSync('icon.svg', iconSvg(ENTWURF));
  const rund = Buffer.from(iconSvg(ENTWURF));
  const eckig = Buffer.from(iconSvg(ENTWURF, { ecken: 0 }));
  await sharp(rund).resize(192, 192).png().toFile('icon-192.png');
  await sharp(rund).resize(512, 512).png().toFile('icon-512.png');
  await sharp(eckig).resize(512, 512).png().toFile('icon-maskable-512.png');
  await sharp(eckig).resize(180, 180).png().toFile('apple-touch-icon.png');
}

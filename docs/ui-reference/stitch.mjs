import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const sharp = createRequire('/home/gandhi/Develop/npm/Re-Edutax/')('sharp');

const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const { dir, slices, vh, docH, out } = spec;

const metas = await Promise.all(slices.map(s => sharp(dir + s.f).metadata()));
const w = metas[0].width, h = metas[0].height;
if (metas.some(m => m.width !== w || m.height !== h))
  throw new Error('slice dimensions differ: ' + JSON.stringify(metas.map(m => [m.width, m.height])));

const scale = h / vh;
const top = y => Math.round(y * scale);
const canvasH = top(slices.at(-1).y) + h;
console.log(`${slices.length} slices  ${w}x${h}  scale ${scale.toFixed(6)}  canvas ${w}x${canvasH}  (docH*scale=${(docH * scale).toFixed(1)})`);

const raws = await Promise.all(slices.map(s =>
  sharp(dir + s.f).greyscale().raw().toBuffer({ resolveWithObject: true })));

let worst = 0;
for (let i = 1; i < slices.length; i++) {
  const dy = top(slices[i].y) - top(slices[i - 1].y);
  const overlap = h - dy;
  if (overlap <= 0) { console.log(`  seam ${i - 1}->${i}: dy=${dy} abuts exactly (slice h=${h}), no gap`); continue; }
  const band = Math.min(overlap, 240);
  const prev = raws[i - 1].data, cur = raws[i].data;
  let diff = 0, n = 0;
  for (let row = 0; row < band; row++) {
    const pRow = dy + row; if (pRow >= h) break;
    for (let x = 0; x < w; x += 3) { diff += Math.abs(prev[pRow * w + x] - cur[row * w + x]); n++; }
  }
  const mad = diff / n; worst = Math.max(worst, mad);
  console.log(`  seam ${i - 1}->${i}: dy=${dy} overlap=${overlap}px mean|diff|=${mad.toFixed(2)} ${mad < 6 ? 'ALIGNED' : 'MISALIGNED'}`);
}

await sharp({ create: { width: w, height: canvasH, channels: 3, background: '#ffffff' } })
  .composite(slices.map(s => ({ input: dir + s.f, left: 0, top: top(s.y) })))
  .jpeg({ quality: 88 })
  .toFile(out);
console.log('wrote', out, worst ? `(worst seam ${worst.toFixed(2)})` : '');

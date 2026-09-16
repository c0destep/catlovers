/**
 * Gera as variantes .webp usadas pelas páginas a partir dos JPGs em `img/`.
 *
 * O Parcel fazia isso em tempo de build via `?as=webp&width=N`. O Vite não tem
 * equivalente embutido, então as variantes são geradas uma vez e commitadas em
 * `img/` junto dos originais. Rode `pnpm images` após trocar algum original.
 */
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const IMG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'img');
const PROJECT_DIR = path.dirname(IMG_DIR);
const PUBLIC_DIR = path.join(PROJECT_DIR, 'public');

// `widths: []` gera apenas o arquivo base, no tamanho `maxWidth`.
const TARGETS = [
  // Herói da home: tem srcset responsivo em index.html.
  { source: 'catlovers.jpg', maxWidth: 1280, widths: [400, 800, 1200] },
  // Heróis internos e imagens de artigo: exibidos a 600px, 1200 cobre telas 2x.
  { source: 'cat_playing.jpg', maxWidth: 1200, widths: [] },
  { source: 'cat_sleeping.jpg', maxWidth: 1200, widths: [] },
  { source: 'cat_window.jpg', maxWidth: 1200, widths: [] }
];

const QUALITY = 80;

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;

const emit = async (pipeline, source, outName, width) => {
  const outPath = path.join(IMG_DIR, outName);
  await pipeline
    .clone()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  const { size } = await stat(outPath);
  console.log(`  ${source} -> ${outName} (${width}px, ${kb(size)})`);
};

await mkdir(IMG_DIR, { recursive: true });
await mkdir(PUBLIC_DIR, { recursive: true });

for (const { source, maxWidth, widths } of TARGETS) {
  const sourcePath = path.join(IMG_DIR, source);
  const pipeline = sharp(sourcePath);
  const { width: nativeWidth } = await pipeline.metadata();
  const base = path.basename(source, path.extname(source));

  console.log(`${source} (${nativeWidth}px de origem)`);
  await emit(pipeline, source, `${base}.webp`, Math.min(maxWidth, nativeWidth));

  for (const width of widths) {
    await emit(pipeline, source, `${base}-${width}.webp`, width);
  }
}

const iconSource = path.join(PROJECT_DIR, 'icon-512.png');
for (const size of [192, 512]) {
  const outName = `icon-${size}.png`;
  const outPath = path.join(PUBLIC_DIR, outName);
  await sharp(iconSource)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 })
    .toFile(outPath);

  const { size: bytes } = await stat(outPath);
  console.log(`  icon-512.png -> public/${outName} (${size}px, ${kb(bytes)})`);
}

console.log('\nPronto. Lembre-se de commitar as imagens geradas.');

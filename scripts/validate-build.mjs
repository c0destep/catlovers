import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectDir, 'dist');
const errors = [];

const exists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const requireFile = async (relativePath, context = 'build') => {
  if (!await exists(path.join(distDir, relativePath))) {
    errors.push(`${context}: recurso ausente: ${relativePath}`);
  }
};

const pages = [
  '404.html',
  'about.html',
  'adoption.html',
  'benefits.html',
  'blog.html',
  'cats.html',
  'happy-endings.html',
  'index.html',
  'post.html',
  'privacy.html',
  'quiz.html',
  'support.html',
  'terms.html'
];

for (const requiredFile of [...pages, 'site.webmanifest', 'sw.js']) {
  await requireFile(requiredFile);
}

const manifestPath = path.join(distDir, 'site.webmanifest');
if (await exists(manifestPath)) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const manifestResources = [
    ...(manifest.icons ?? []).map((icon) => icon.src),
    ...(manifest.shortcuts ?? []).flatMap((shortcut) => [
      shortcut.url,
      ...(shortcut.icons ?? []).map((icon) => icon.src)
    ])
  ];

  for (const resource of manifestResources) {
    const relativePath = resource.replace(/^\.\//, '').split(/[?#]/)[0];
    await requireFile(relativePath, 'manifesto');
  }

  for (const expectedSize of [192, 512]) {
    const iconPath = path.join(distDir, `icon-${expectedSize}.png`);
    if (await exists(iconPath)) {
      const metadata = await sharp(iconPath).metadata();
      if (metadata.width !== expectedSize || metadata.height !== expectedSize || metadata.format !== 'png') {
        errors.push(`manifesto: icon-${expectedSize}.png deve ser um PNG de ${expectedSize}x${expectedSize}.`);
      }
    }
  }
}

const isLocalReference = (reference) => (
  reference &&
  !reference.startsWith('#') &&
  !reference.startsWith('data:') &&
  !reference.startsWith('mailto:') &&
  !reference.startsWith('tel:') &&
  !/^https?:\/\//.test(reference)
);

for (const page of pages) {
  const pagePath = path.join(distDir, page);
  if (!await exists(pagePath)) continue;
  const html = await readFile(pagePath, 'utf8');
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)]
    .flatMap((match) => match[1].split(','))
    .map((candidate) => candidate.trim().split(/\s+/)[0]);

  for (const reference of [...references, ...srcsets].filter(isLocalReference)) {
    const cleanReference = reference.split(/[?#]/)[0].replace(/^\.\//, '');
    const relativePath = path.normalize(path.join(path.dirname(page), cleanReference));
    await requireFile(relativePath, page);
  }
}

const serviceWorkerPath = path.join(distDir, 'sw.js');
if (await exists(serviceWorkerPath)) {
  const serviceWorker = await readFile(serviceWorkerPath, 'utf8');
  if (serviceWorker.includes('__CACHE_VERSION__') || serviceWorker.includes('__PRECACHE_MANIFEST__')) {
    errors.push('service worker: marcadores de build não foram substituídos.');
  }

  const manifestMatch = serviceWorker.match(/const PRE_CACHE_URLS = (\[[\s\S]*?\]);/);
  if (!manifestMatch) {
    errors.push('service worker: lista de pré-cache não encontrada.');
  } else {
    const cachedResources = JSON.parse(manifestMatch[1]);
    for (const page of pages) {
      if (!cachedResources.includes(`./${page}`)) {
        errors.push(`service worker: ${page} não está no pré-cache.`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Build inválida:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  const assets = await readdir(distDir);
  console.log(`Build validada: ${pages.length} páginas e ${assets.length} entradas na raiz.`);
}

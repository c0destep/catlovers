import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectDir, 'dist');
const serviceWorkerPath = path.join(distDir, 'sw.js');

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  }));
  return files.flat();
};

const toDistPath = (filePath) => path.relative(distDir, filePath).split(path.sep).join('/');
const allFiles = (await walk(distDir)).filter((filePath) => toDistPath(filePath) !== 'sw.js');
allFiles.sort((left, right) => toDistPath(left).localeCompare(toDistPath(right)));

const hash = createHash('sha256');
for (const filePath of allFiles) {
  hash.update(toDistPath(filePath));
  hash.update(await readFile(filePath));
}

const cacheVersion = hash.digest('hex').slice(0, 12);
const preCacheUrls = allFiles.map((filePath) => `./${toDistPath(filePath)}`);
let serviceWorker = await readFile(serviceWorkerPath, 'utf8');

if (!serviceWorker.includes('__CACHE_VERSION__') || !serviceWorker.includes('/* __PRECACHE_MANIFEST__ */ []')) {
  throw new Error('Os marcadores de build não foram encontrados em dist/sw.js.');
}

serviceWorker = serviceWorker
  .replace('__CACHE_VERSION__', cacheVersion)
  .replace('/* __PRECACHE_MANIFEST__ */ []', JSON.stringify(preCacheUrls, null, 2));

await writeFile(serviceWorkerPath, serviceWorker);

const { size } = await stat(serviceWorkerPath);
console.log(`PWA preparada: cache ${cacheVersion}, ${preCacheUrls.length} recursos, ${(size / 1024).toFixed(1)} kB.`);

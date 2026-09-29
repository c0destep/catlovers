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

const publishedBaseUrl = 'https://c0destep.github.io/catlovers/';
const expectedPageUrl = (page) => page === 'index.html' ? publishedBaseUrl : `${publishedBaseUrl}${page}`;

const parseAttributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([^\s=/>]+)\s*=\s*(["'])(.*?)\2/g)]
    .map((match) => [match[1].toLowerCase(), match[3]])
);

const findTags = (html, tagName) => (
  [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))]
    .map((match) => parseAttributes(match[0]))
);

const findTagsByAttribute = (tags, attribute, value) => tags.filter((attributes) => {
  const actualValue = attributes[attribute];
  return actualValue && actualValue.toLowerCase() === value;
});

const requireSingleValue = (page, tags, attribute, value, contentAttribute) => {
  const matches = findTagsByAttribute(tags, attribute, value);
  if (matches.length !== 1) {
    errors.push(`${page}: deve conter exatamente uma tag ${attribute}="${value}".`);
    return '';
  }

  const content = matches[0][contentAttribute]?.trim() ?? '';
  if (!content) {
    errors.push(`${page}: ${attribute}="${value}" deve ter ${contentAttribute} preenchido.`);
  }
  return content;
};

for (const requiredFile of [...pages, 'robots.txt', 'sitemap.xml', 'site.webmanifest', 'sw.js']) {
  await requireFile(requiredFile);
}

const manifestPath = path.join(distDir, 'site.webmanifest');
if (await exists(manifestPath)) {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.start_url !== './') {
    errors.push('manifesto: start_url deve ser relativo à pasta publicada.');
  }
  if (manifest.scope !== './') {
    errors.push('manifesto: scope deve ser relativo à pasta publicada.');
  }

  const manifestResources = [
    ...(manifest.icons ?? []).map((icon) => icon.src),
    ...(manifest.screenshots ?? []).map((screenshot) => screenshot.src),
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

  for (const screenshot of manifest.screenshots ?? []) {
    const screenshotPath = path.join(distDir, screenshot.src.replace(/^\.\//, ''));
    if (!await exists(screenshotPath)) continue;

    const [expectedWidth, expectedHeight] = screenshot.sizes.split('x').map(Number);
    const metadata = await sharp(screenshotPath).metadata();
    if (metadata.width !== expectedWidth || metadata.height !== expectedHeight || metadata.format !== 'png') {
      errors.push(`manifesto: ${screenshot.src} não corresponde a ${screenshot.sizes} em PNG.`);
    }
  }
}

const isLocalLink = (reference) => (
  reference &&
  !reference.startsWith('data:') &&
  !reference.startsWith('mailto:') &&
  !reference.startsWith('tel:') &&
  !/^https?:\/\//.test(reference)
);

const isLocalReference = (reference) => isLocalLink(reference) && !reference.startsWith('#');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const indexPath = path.join(distDir, 'index.html');
if (await exists(indexPath)) {
  const indexHtml = await readFile(indexPath, 'utf8');
  const stylesheetReferences = [...indexHtml.matchAll(/href="([^"]+\.css)"/g)]
    .map((match) => match[1])
    .filter(isLocalReference);
  const stylesheets = await Promise.all(stylesheetReferences.map(async (reference) => {
    const relativePath = reference.split(/[?#]/)[0].replace(/^\.\//, '');
    const stylesheetPath = path.join(distDir, relativePath);
    return await exists(stylesheetPath) ? readFile(stylesheetPath, 'utf8') : '';
  }));
  const hasDarkTheme = stylesheets.some((stylesheet) => (
    /\[data-theme=(?:"dark"|'dark'|dark)\]/.test(stylesheet) &&
    /--cat-bg:\s*#1a1816/.test(stylesheet)
  ));

  if (!hasDarkTheme) {
    errors.push('tema: CSS compilado não contém a paleta escura vinculada a data-theme="dark".');
  }
}

const validateFragment = async (sourcePage, reference) => {
  const [pathname, rawFragment] = reference.split('#', 2);
  if (!rawFragment) return;

  const targetPage = pathname
    ? path.normalize(path.join(path.dirname(sourcePage), pathname.replace(/^\.\//, '')))
    : sourcePage;

  if (!targetPage.endsWith('.html')) return;

  const targetPath = path.join(distDir, targetPage);
  if (!await exists(targetPath)) return;

  const fragment = decodeURIComponent(rawFragment);
  const targetHtml = await readFile(targetPath, 'utf8');
  const fragmentPattern = new RegExp(`(?:id|name)=["']${escapeRegExp(fragment)}["']`);
  if (!fragmentPattern.test(targetHtml)) {
    errors.push(`${sourcePage}: fragmento ausente em ${reference}`);
  }
};

const seoValuesByPage = new Map();

for (const page of pages) {
  const pagePath = path.join(distDir, page);
  if (!await exists(pagePath)) continue;
  const html = await readFile(pagePath, 'utf8');
  const metaTags = findTags(html, 'meta');
  const linkTags = findTags(html, 'link');
  const expectedUrl = expectedPageUrl(page);
  const expectedRobots = page === '404.html' ? 'noindex,follow' : 'index,follow';
  const titleMatches = [...html.matchAll(/<title\b[^>]*>([^<]+)<\/title>/gi)];
  const title = titleMatches.length === 1 ? titleMatches[0][1].trim() : '';
  if (titleMatches.length !== 1 || !title) {
    errors.push(`${page}: deve conter exatamente um title preenchido.`);
  }

  const description = requireSingleValue(page, metaTags, 'name', 'description', 'content');
  const robots = requireSingleValue(page, metaTags, 'name', 'robots', 'content');
  const canonical = requireSingleValue(page, linkTags, 'rel', 'canonical', 'href');
  const openGraphTitle = requireSingleValue(page, metaTags, 'property', 'og:title', 'content');
  const openGraphDescription = requireSingleValue(page, metaTags, 'property', 'og:description', 'content');
  const openGraphUrl = requireSingleValue(page, metaTags, 'property', 'og:url', 'content');

  if (robots !== expectedRobots) {
    errors.push(`${page}: robots deve ser "${expectedRobots}".`);
  }
  if (canonical !== expectedUrl) {
    errors.push(`${page}: canonical deve ser ${expectedUrl}`);
  }
  if (openGraphUrl !== expectedUrl) {
    errors.push(`${page}: og:url deve ser ${expectedUrl}`);
  }
  if (openGraphTitle !== title) {
    errors.push(`${page}: og:title deve corresponder ao title em PT-BR.`);
  }
  if (openGraphDescription !== description) {
    errors.push(`${page}: og:description deve corresponder à description em PT-BR.`);
  }
  const localizedLinks = linkTags.filter((attributes) => 'hreflang' in attributes);
  if (localizedLinks.length) {
    errors.push(`${page}: links com hreflang não devem ser publicados sem URLs localizadas reais.`);
  }

  seoValuesByPage.set(page, {
    canonical,
    openGraphTitle,
    openGraphDescription,
    openGraphUrl
  });

  const socialImage = html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/)?.[1];
  if (socialImage !== 'https://c0destep.github.io/catlovers/screenshot-wide.png') {
    errors.push(`${page}: og:image deve apontar para a imagem social publicada.`);
  }
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)]
    .flatMap((match) => match[1].split(','))
    .map((candidate) => candidate.trim().split(/\s+/)[0]);

  for (const reference of [...references, ...srcsets].filter(isLocalReference)) {
    const cleanReference = reference.split(/[?#]/)[0].replace(/^\.\//, '');
    const relativePath = path.normalize(path.join(path.dirname(page), cleanReference));
    await requireFile(relativePath, page);
  }

  const localLinks = [...html.matchAll(/href="([^"]+)"/g)]
    .map((match) => match[1])
    .filter(isLocalLink);
  for (const link of localLinks) {
    await validateFragment(page, link);
  }
}

for (const field of ['canonical', 'openGraphTitle', 'openGraphDescription', 'openGraphUrl']) {
  const ownersByValue = new Map();
  for (const [page, seoValues] of seoValuesByPage) {
    const value = seoValues[field];
    if (!value) continue;
    const previousPage = ownersByValue.get(value);
    if (previousPage) {
      errors.push(`SEO: ${field} deve ser específico por página; valor repetido em ${previousPage} e ${page}.`);
    } else {
      ownersByValue.set(value, page);
    }
  }
}

const indexablePages = pages
  .filter((page) => page !== '404.html');
const expectedSitemapUrls = indexablePages
  .map((page) => seoValuesByPage.get(page)?.canonical)
  .filter(Boolean);
if (expectedSitemapUrls.length !== indexablePages.length) {
  errors.push(`sitemap: não foi possível obter as ${indexablePages.length} URLs canônicas indexáveis.`);
}
const sitemapPath = path.join(distDir, 'sitemap.xml');
if (await exists(sitemapPath)) {
  const sitemap = await readFile(sitemapPath, 'utf8');
  const openingLocationTags = [...sitemap.matchAll(/<loc\b[^>]*>/gi)];
  const sitemapUrls = [...sitemap.matchAll(/<loc\b[^>]*>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1].trim());

  if (openingLocationTags.length !== sitemapUrls.length) {
    errors.push('sitemap: toda tag loc deve estar preenchida e fechada corretamente.');
  }

  const uniqueSitemapUrls = new Set(sitemapUrls);
  if (uniqueSitemapUrls.size !== sitemapUrls.length) {
    errors.push('sitemap: URLs duplicadas não são permitidas.');
  }

  const expectedUrls = new Set(expectedSitemapUrls);
  const missingUrls = expectedSitemapUrls.filter((url) => !uniqueSitemapUrls.has(url));
  const extraUrls = [...uniqueSitemapUrls].filter((url) => !expectedUrls.has(url));
  if (missingUrls.length) {
    errors.push(`sitemap: URLs canônicas ausentes: ${missingUrls.join(', ')}`);
  }
  if (extraUrls.length) {
    errors.push(`sitemap: URLs inesperadas: ${extraUrls.join(', ')}`);
  }
  if (sitemapUrls.length !== indexablePages.length) {
    errors.push(`sitemap: deve conter exatamente ${indexablePages.length} URLs indexáveis.`);
  }
}

const publishedSitemapUrl = `${publishedBaseUrl}sitemap.xml`;
const robotsPath = path.join(distDir, 'robots.txt');
if (await exists(robotsPath)) {
  const robots = await readFile(robotsPath, 'utf8');
  const directives = robots
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return { name: '', value: '', valid: false };
      return {
        name: line.slice(0, separatorIndex).trim().toLowerCase(),
        value: line.slice(separatorIndex + 1).trim(),
        valid: true
      };
    });

  if (directives.some((directive) => !directive.valid)) {
    errors.push('robots: toda diretiva deve usar o formato "nome: valor".');
  }

  const robotGroups = [];
  let currentGroup = null;
  for (const directive of directives) {
    if (directive.name === 'user-agent') {
      if (!currentGroup || currentGroup.rules.length) {
        currentGroup = { agents: [], rules: [] };
        robotGroups.push(currentGroup);
      }
      currentGroup.agents.push(directive.value);
    } else if (directive.name !== 'sitemap' && currentGroup) {
      currentGroup.rules.push(directive);
    }
  }

  const wildcardGroups = robotGroups.filter((group) => group.agents.includes('*'));
  if (wildcardGroups.length !== 1) {
    errors.push('robots: deve conter exatamente um grupo User-agent: *.');
  } else {
    const blocksGeneralCrawl = wildcardGroups[0].rules
      .some((directive) => directive.name === 'disallow' && directive.value !== '');
    if (blocksGeneralCrawl) {
      errors.push('robots: o grupo User-agent: * deve permitir o rastreamento geral.');
    }
  }

  const sitemapDirectives = directives.filter((directive) => directive.name === 'sitemap');
  if (sitemapDirectives.length !== 1 || sitemapDirectives[0].value !== publishedSitemapUrl) {
    errors.push(`robots: deve apontar uma única vez para ${publishedSitemapUrl}`);
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

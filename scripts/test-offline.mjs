import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const previewUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:1234/';
const requestedBrowser = process.env.OFFLINE_BROWSER_PATH;
const browserCandidates = [
  requestedBrowser,
  process.env.CYPRESS_BROWSER === 'chromium' ? 'chromium' : undefined,
  process.env.CYPRESS_BROWSER === 'chrome' ? 'google-chrome' : undefined,
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser'
].filter(Boolean);

const browserPath = [...new Set(browserCandidates)].find((candidate) => (
  spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0
));

if (!browserPath) {
  throw new Error(
    'Chrome ou Chromium não encontrado para o teste offline. Defina OFFLINE_BROWSER_PATH.'
  );
}

const profileDirectory = await mkdtemp(join(tmpdir(), 'catlovers-offline-'));
const debuggingPort = 9300 + (process.pid % 500);
const browser = spawn(browserPath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${debuggingPort}`,
  `--user-data-dir=${profileDirectory}`,
  'about:blank'
], { stdio: 'ignore' });

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitForDebugger = async () => {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (browser.exitCode !== null) {
      throw new Error('O navegador encerrou antes de disponibilizar o protocolo de depuração.');
    }

    try {
      const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/version`);
      if (response.ok) return;
    } catch {
      // O navegador ainda está iniciando.
    }

    await wait(250);
  }

  throw new Error('O navegador não disponibilizou o protocolo de depuração.');
};

class DevToolsSession {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });

    this.socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);

      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }

      const listeners = this.listeners.get(message.method) ?? [];
      this.listeners.delete(message.method);
      listeners.forEach((resolve) => resolve(message.params));
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitFor(method, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const listener = (params) => {
        clearTimeout(timer);
        resolve(params);
      };
      const timer = setTimeout(() => {
        const listeners = this.listeners.get(method) ?? [];
        this.listeners.set(method, listeners.filter((candidate) => candidate !== listener));
        reject(new Error(`Tempo esgotado ao aguardar ${method}.`));
      }, timeout);
      const listeners = this.listeners.get(method) ?? [];
      listeners.push(listener);
      this.listeners.set(method, listeners);
    });
  }

  close() {
    this.socket.close();
  }
}

const navigate = async (session, url) => {
  const loaded = session.waitFor('Page.loadEventFired');
  const result = await session.send('Page.navigate', { url });
  if (result.errorText) throw new Error(`Falha ao abrir ${url}: ${result.errorText}`);
  await loaded;
};

const evaluate = async (session, expression) => {
  const { result, exceptionDetails } = await session.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description || exceptionDetails.text);
  }

  return result.value;
};

let session;

try {
  await waitForDebugger();
  const targetResponse = await fetch(
    `http://127.0.0.1:${debuggingPort}/json/new?${encodeURIComponent(previewUrl)}`,
    { method: 'PUT' }
  );
  const target = await targetResponse.json();
  session = new DevToolsSession(target.webSocketDebuggerUrl);
  await session.connect();
  await Promise.all([
    session.send('Page.enable'),
    session.send('Runtime.enable'),
    session.send('Network.enable')
  ]);

  await navigate(session, previewUrl);

  const serviceWorker = await evaluate(session, `(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Service worker sem controle da página.')), 5000);
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
      });
    }

    const cachedPage = await caches.match(new URL('about.html', document.baseURI));
    return {
      cached: Boolean(cachedPage),
      script: registration.active?.scriptURL,
      state: registration.active?.state
    };
  })()`);

  if (!serviceWorker.cached || serviceWorker.state !== 'activated' || !serviceWorker.script.endsWith('/sw.js')) {
    throw new Error(`Service worker ou pré-cache inválido: ${JSON.stringify(serviceWorker)}`);
  }

  await session.send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0
  });

  await navigate(session, new URL('about.html', previewUrl).href);
  const offlinePage = await evaluate(session, `({
    pathname: location.pathname,
    title: document.title,
    heading: document.querySelector('h1')?.textContent.trim()
  })`);

  if (
    !offlinePage.pathname.endsWith('/about.html') ||
    !offlinePage.title.includes('Catlovers') ||
    !offlinePage.heading
  ) {
    throw new Error(`A página offline não foi renderizada: ${JSON.stringify(offlinePage)}`);
  }

  console.log(`Offline validado em ${browserPath}: ${offlinePage.title}`);
} finally {
  session?.close();
  if (browser.exitCode === null) {
    const browserExited = new Promise((resolve) => browser.once('exit', resolve));
    browser.kill('SIGTERM');
    await Promise.race([browserExited, wait(5000)]);
  }
  await rm(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}

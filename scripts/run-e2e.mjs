import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { preview as startPreview } from 'vite';

const previewUrl = 'http://127.0.0.1:1234/';
const browser = process.env.CYPRESS_BROWSER || 'chrome';
const forwardedArguments = process.argv.slice(2);
if (forwardedArguments[0] === '--') forwardedArguments.shift();
const viteConfig = fileURLToPath(new URL('../vite.config.mjs', import.meta.url));
const signalExitCodes = { SIGINT: 130, SIGTERM: 143 };
let previewServer;
let activeProcess;
let receivedSignal;

const handleSignal = (signal) => {
  if (receivedSignal) return;

  receivedSignal = signal;
  process.exitCode = signalExitCodes[signal];

  if (activeProcess?.exitCode === null) activeProcess.kill(signal);
};

const onSigint = () => handleSignal('SIGINT');
const onSigterm = () => handleSignal('SIGTERM');
process.once('SIGINT', onSigint);
process.once('SIGTERM', onSigterm);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitForPreview = async () => {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (receivedSignal) throw new Error(`Execução interrompida por ${receivedSignal}.`);

    try {
      const response = await fetch(previewUrl);
      if (response.ok) return;
    } catch {
      // O servidor ainda está iniciando.
    }

    await wait(500);
  }

  throw new Error(`O preview não respondeu em ${previewUrl}.`);
};

const runProcess = (command, arguments_, description) => new Promise((resolve, reject) => {
  const child = spawn(command, arguments_, { env: process.env, stdio: 'inherit' });
  activeProcess = child;

  const clearActiveProcess = () => {
    if (activeProcess === child) activeProcess = undefined;
  };

  child.once('error', (error) => {
    clearActiveProcess();
    reject(error);
  });
  child.once('exit', (code, signal) => {
    clearActiveProcess();
    if (signal) {
      reject(new Error(`${description} encerrado pelo sinal ${signal}.`));
      return;
    }
    resolve(code ?? 1);
  });
});

const runCypress = () => runProcess(
  process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
  ['exec', 'cypress', 'run', '--browser', browser, ...forwardedArguments],
  'Cypress'
);

const runOfflineTest = () => runProcess(
  process.execPath,
  ['scripts/test-offline.mjs'],
  'Teste offline'
);

try {
  previewServer = await startPreview({
    configFile: viteConfig,
    preview: {
      host: '127.0.0.1',
      port: 1234,
      strictPort: true,
      open: false
    }
  });

  await waitForPreview();
  if (receivedSignal) throw new Error(`Execução interrompida por ${receivedSignal}.`);

  const cypressExitCode = await runCypress();
  if (receivedSignal) {
    throw new Error(`Execução interrompida por ${receivedSignal}.`);
  } else if (cypressExitCode !== 0) {
    process.exitCode = cypressExitCode;
  } else {
    const offlineExitCode = await runOfflineTest();
    if (receivedSignal) {
      throw new Error(`Execução interrompida por ${receivedSignal}.`);
    }
    process.exitCode = offlineExitCode;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  if (!receivedSignal) process.exitCode = 1;
} finally {
  process.off('SIGINT', onSigint);
  process.off('SIGTERM', onSigterm);
  if (activeProcess?.exitCode === null) activeProcess.kill(receivedSignal || 'SIGTERM');
  if (previewServer) await previewServer.close();
}

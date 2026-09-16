import { spawn } from 'node:child_process';

const previewUrl = 'http://127.0.0.1:1234/';
const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const browser = process.env.CYPRESS_BROWSER || 'chrome';
const forwardedArguments = process.argv.slice(2);
if (forwardedArguments[0] === '--') forwardedArguments.shift();
const previewOutput = [];

const preview = spawn(pnpmCommand, ['preview'], {
  env: { ...process.env, NO_COLOR: '1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

for (const stream of [preview.stdout, preview.stderr]) {
  stream.on('data', (chunk) => {
    previewOutput.push(chunk.toString());
  });
}

const stopPreview = () => {
  if (preview.exitCode === null) preview.kill('SIGTERM');
};

process.once('SIGINT', () => {
  stopPreview();
  process.exitCode = 130;
});
process.once('SIGTERM', () => {
  stopPreview();
  process.exitCode = 143;
});

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitForPreview = async () => {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (preview.exitCode !== null) {
      throw new Error(`O preview encerrou antes de ficar disponível.\n${previewOutput.join('')}`);
    }

    try {
      const response = await fetch(previewUrl);
      if (response.ok) return;
    } catch {
      // O servidor ainda está iniciando.
    }

    await wait(500);
  }

  throw new Error(`O preview não respondeu em ${previewUrl}.\n${previewOutput.join('')}`);
};

const runCypress = () => new Promise((resolve, reject) => {
  const cypress = spawn(
    pnpmCommand,
    ['exec', 'cypress', 'run', '--browser', browser, ...forwardedArguments],
    { stdio: 'inherit' }
  );

  cypress.once('error', reject);
  cypress.once('exit', (code, signal) => {
    if (signal) {
      reject(new Error(`Cypress encerrado pelo sinal ${signal}.`));
      return;
    }
    resolve(code ?? 1);
  });
});

try {
  await waitForPreview();
  process.exitCode = await runCypress();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  stopPreview();
}

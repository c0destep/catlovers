import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalogFile } from './validate-cats.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = (name) => path.join(projectDir, 'tests', 'fixtures', name);

await validateCatalogFile(path.join(projectDir, 'cats.json'));

await assert.rejects(
  validateCatalogFile(fixturePath('cats-invalid-schema.json')),
  /\/0\/age .*allowed values|\/0\/name .*characters|additional properties/i,
  'fixture com schema inválido deveria falhar'
);

await assert.rejects(
  validateCatalogFile(fixturePath('cats-duplicate-id.json')),
  /id 1 duplicado/,
  'fixture com id duplicado deveria falhar'
);

console.log('Catálogo válido e fixtures inválidos rejeitados conforme esperado.');

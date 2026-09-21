import Ajv from 'ajv';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(projectDir, 'schema', 'cats.schema.json');
const defaultDataPath = path.join(projectDir, 'cats.json');

const isUri = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const formatInstancePath = (instancePath) => instancePath || '(catálogo)';

const formatAjvError = (error) => {
  const location = formatInstancePath(error.instancePath);
  return `${location} ${error.message}`;
};

const createValidator = (schema) => {
  const ajv = new Ajv({ allErrors: true, strict: true });
  ajv.addFormat('uri', { type: 'string', validate: isUri });
  return ajv.compile(schema);
};

const findDuplicateIds = (catalogue) => {
  const firstOccurrence = new Map();
  const errors = [];

  catalogue.forEach((cat, index) => {
    if (!Number.isInteger(cat?.id) || cat.id < 1) return;

    const previousIndex = firstOccurrence.get(cat.id);
    if (previousIndex !== undefined) {
      errors.push(
        `/${index}/id id ${cat.id} duplicado (também aparece no registro ${previousIndex + 1})`
      );
      return;
    }

    firstOccurrence.set(cat.id, index);
  });

  return errors;
};

export const validateCatalog = (catalogue, schema) => {
  const validate = createValidator(schema);
  const schemaValid = validate(catalogue);
  const errors = schemaValid ? [] : validate.errors.map(formatAjvError);

  if (Array.isArray(catalogue)) {
    errors.push(...findDuplicateIds(catalogue));
  }

  return errors;
};

const loadJson = async (filePath, label) => {
  let source;
  try {
    source = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`não foi possível ler ${label}: ${error.message}`);
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`JSON inválido em ${label}: ${error.message}`);
  }
};

export const validateCatalogFile = async (dataPath = defaultDataPath) => {
  const [catalogue, schema] = await Promise.all([
    loadJson(dataPath, dataPath),
    loadJson(schemaPath, schemaPath)
  ]);
  const errors = validateCatalog(catalogue, schema);

  if (errors.length > 0) {
    throw new Error(`validação do catálogo falhou em ${dataPath}:\n- ${errors.join('\n- ')}`);
  }
};

const run = async () => {
  const requestedPath = process.argv[2];
  const dataPath = requestedPath
    ? path.resolve(process.cwd(), requestedPath)
    : defaultDataPath;

  try {
    await validateCatalogFile(dataPath);
    console.log(`Catálogo válido: ${dataPath}`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exitCode = 1;
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await run();
}

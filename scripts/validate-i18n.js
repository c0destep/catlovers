const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, '../languages');
const ptBrPath = path.join(langDir, 'pt_BR.json');
const enUsPath = path.join(langDir, 'en_US.json');
const esEsPath = path.join(langDir, 'es_ES.json');

const getKeys = (obj, prefix = '') => {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], `${prefix}${key}.`));
    } else {
      keys.push(`${prefix}${key}`);
    }
  }
  return keys;
};

try {
  const ptBR = JSON.parse(fs.readFileSync(ptBrPath, 'utf8'));
  const enUS = JSON.parse(fs.readFileSync(enUsPath, 'utf8'));
  const esES = JSON.parse(fs.readFileSync(esEsPath, 'utf8'));

  const ptKeys = getKeys(ptBR).sort();
  const enKeys = getKeys(enUS).sort();
  const esKeys = getKeys(esES).sort();

  let hasErrors = false;

  const compareKeys = (baseKeys, targetKeys, baseLang, targetLang) => {
    const missing = baseKeys.filter(k => !targetKeys.includes(k));
    if (missing.length > 0) {
      console.error(`❌ Chaves faltando no arquivo ${targetLang} (presentes em ${baseLang}):`);
      missing.forEach(k => console.error(`   - ${k}`));
      hasErrors = true;
    }
  };

  compareKeys(ptKeys, enKeys, 'pt_BR', 'en_US');
  compareKeys(ptKeys, esKeys, 'pt_BR', 'es_ES');
  compareKeys(enKeys, ptKeys, 'en_US', 'pt_BR');

  if (hasErrors) {
    console.error('\nFalha na validação de i18n! Sincronize as chaves antes de continuar.');
    process.exit(1);
  } else {
    console.log('✅ Arquivos de tradução (i18n) validados com sucesso.');
  }

} catch (e) {
  console.error('Erro na validação i18n:', e);
  process.exit(1);
}

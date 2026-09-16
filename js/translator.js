const DEFAULT_SELECTOR = '[data-i18n]';

const getTranslation = (translations, key) => key
  .split('.')
  .reduce((value, segment) => value && value[segment], translations);

const parseDescriptor = (descriptor, fallbackAttribute) => {
  const attributeMatch = descriptor.match(/^\[([^\]]+)](.+)$/);

  if (!attributeMatch) {
    return { attribute: fallbackAttribute, key: descriptor };
  }

  return { attribute: attributeMatch[1], key: attributeMatch[2] };
};

/**
 * Browser-only translator for the project's local JSON dictionaries.
 */
export default class Translator {
  constructor ({ defaultLanguage = 'pt_BR', persist = false, persistKey = 'preferred_language', selector = DEFAULT_SELECTOR } = {}) {
    this.defaultLanguage = defaultLanguage;
    this.currentLanguage = defaultLanguage;
    this.persist = persist;
    this.persistKey = persistKey;
    this.selector = selector;
    this.languages = new Map();
  }

  add (language, translations) {
    this.languages.set(language, translations);
    return this;
  }

  translateForKey (key, language = this.currentLanguage) {
    const translations = this.languages.get(language);
    if (!translations) return null;

    return getTranslation(translations, key) ?? null;
  }

  translateElementTo (element, language = this.currentLanguage) {
    const rawDescriptors = element?.getAttribute('data-i18n')?.trim();
    if (!rawDescriptors || !this.languages.has(language)) return;

    const descriptors = rawDescriptors.split(/\s+/);
    const attributes = element.getAttribute('data-i18n-attr')?.trim().split(/\s+/) ?? [];

    descriptors.forEach((descriptor, index) => {
      const { attribute, key } = parseDescriptor(descriptor, attributes[index]);
      const translation = this.translateForKey(key, language);
      if (translation === null) return;

      if (attribute && attribute !== 'innerHTML') {
        element.setAttribute(attribute, String(translation));
      } else {
        element.innerHTML = String(translation);
      }
    });
  }

  translatePageTo (language = this.defaultLanguage) {
    if (!this.languages.has(language)) return false;

    document.querySelectorAll(this.selector).forEach((element) => {
      this.translateElementTo(element, language);
    });

    this.currentLanguage = language;

    if (this.persist) {
      try {
        localStorage.setItem(this.persistKey, language);
      } catch {
        // Translation must still work when storage is unavailable.
      }
    }

    return true;
  }
}

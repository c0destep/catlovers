// Translation helper to reduce repetitive calls
const translateElement = (element, language) => {
  if (window.catloversTranslator) {
    window.catloversTranslator.translateElementTo(element, language);
  }
};

const translatePage = (language) => {
  if (window.catloversTranslator) {
    window.catloversTranslator.translatePageTo(language);
  }
};

// Export for use in other modules
export const translationHelper = {
  translateElement,
  translatePage
};

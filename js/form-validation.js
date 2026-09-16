document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adoption-form');
  if (!form) return;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalSubmitI18n = submitButton.getAttribute('data-i18n') || 'form.submit';

  const resetSubmitState = () => {
    submitButton.setAttribute('data-i18n', originalSubmitI18n);
    submitButton.classList.remove('button--success');
    if (window.catloversTranslator) window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
  };

  const validateField = (field) => {
    const errorSpan = document.getElementById(`${field.id}-error`);
    let isValid = true;

    if (field.validity.valueMissing) {
      isValid = false;
    } else if (field.type === 'email' && field.validity.typeMismatch) {
      isValid = false;
    }

    if (!isValid) {
      field.setAttribute('aria-invalid', 'true');
      const errorKey = field.validity.valueMissing ? 'form.errorRequired' : 'form.errorEmail';
      errorSpan.setAttribute('data-i18n', errorKey);
      field.classList.add('is-invalid');
    } else {
      field.removeAttribute('aria-invalid');
      errorSpan.removeAttribute('data-i18n');
      errorSpan.textContent = '';
      field.classList.remove('is-invalid');
    }

    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
    }

    return isValid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach((input) => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      submitButton.setAttribute('data-i18n', 'form.success');
      submitButton.classList.add('button--success');
      if (window.catloversTranslator) window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
      form.reset();
    } else {
      // Focus on first invalid field for accessibility
      const firstInvalid = form.querySelector('[aria-invalid=\'true\']');
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });

  form.addEventListener('blur', (e) => {
    if (e.target.tagName === 'INPUT') {
      validateField(e.target);
    }
  }, true);

  form.addEventListener('input', () => {
    if (submitButton.getAttribute('data-i18n') === 'form.success') {
      resetSubmitState();
    }
  });
});

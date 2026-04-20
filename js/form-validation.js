document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adoption-form");
  if (!form) return;

  const validateField = (field) => {
    const errorSpan = document.getElementById(`${field.id}-error`);
    let isValid = true;
    let errorMessage = "";

    if (field.validity.valueMissing) {
      isValid = false;
      errorMessage = "Este campo é obrigatório.";
    } else if (field.type === "email" && field.validity.typeMismatch) {
      isValid = false;
      errorMessage = "Por favor, insira um e-mail válido.";
    }

    if (!isValid) {
      field.setAttribute("aria-invalid", "true");
      const errorKey = field.validity.valueMissing ? "form.errorRequired" : "form.errorEmail";
      errorSpan.setAttribute("data-i18n", errorKey);
      field.classList.add("is-invalid");
    } else {
      field.removeAttribute("aria-invalid");
      errorSpan.removeAttribute("data-i18n");
      errorSpan.textContent = "";
      field.classList.remove("is-invalid");
    }

    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
    }

    return isValid;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let isFormValid = true;
    const inputs = form.querySelectorAll("input[required]");

    inputs.forEach((input) => {
      if (!validateField(input)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      // Simulate form submission
      const btn = form.querySelector("button[type='submit']");
      const originalI18n = btn.getAttribute("data-i18n") || "form.submit";
      
      btn.setAttribute("data-i18n", "form.sending");
      if (window.catloversTranslator) window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
      btn.disabled = true;

      setTimeout(() => {
        btn.setAttribute("data-i18n", "form.success");
        btn.classList.add("button--success");
        if (window.catloversTranslator) window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
        form.reset();
        
        setTimeout(() => {
          btn.setAttribute("data-i18n", originalI18n);
          btn.classList.remove("button--success");
          if (window.catloversTranslator) window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
          btn.disabled = false;
        }, 3000);
      }, 1500);
    } else {
      // Focus on first invalid field for accessibility
      const firstInvalid = form.querySelector("[aria-invalid='true']");
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });

  form.addEventListener("blur", (e) => {
    if (e.target.tagName === "INPUT") {
      validateField(e.target);
    }
  }, true);
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quiz-form');
  const resultDiv = document.getElementById('quiz-result');
  const resultProfile = document.getElementById('result-profile');
  const resultLink = document.getElementById('result-link');
  const announcer = document.getElementById('quiz-announcer');
  const steps = form?.querySelectorAll('.quiz-step') ?? [];

  if (!form) return;

  const clearStepError = (step) => {
    const error = step.querySelector('.quiz-step__error');
    step.removeAttribute('aria-invalid');
    error?.removeAttribute('data-i18n');
    if (error) error.textContent = '';
  };

  const validateSteps = () => {
    let firstInvalid = null;

    steps.forEach((step) => {
      if (step.querySelector('input:checked')) {
        clearStepError(step);
        return;
      }

      firstInvalid ??= step;
      step.setAttribute('aria-invalid', 'true');
      const error = step.querySelector('.quiz-step__error');
      error?.setAttribute('data-i18n', 'quiz.errorRequired');
    });

    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(window.catloversTranslator.currentLanguage);
    }

    if (firstInvalid) {
      const language = localStorage.getItem('preferred_language') || 'pt_BR';
      if (announcer && window.catloversTranslator) {
        announcer.textContent = window.catloversTranslator.translateForKey('quiz.errorRequired', language);
      }
      firstInvalid.focus();
    }

    return firstInvalid === null;
  };

  form.addEventListener('change', (event) => {
    const step = event.target.closest('.quiz-step');
    if (step) clearStepError(step);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateSteps()) return;

    const formData = new FormData(form);
    const home = formData.get('home');
    const time = formData.get('time');
    const activity = formData.get('activity');

    // Lógica de votação por maioria simples baseada nas 3 perguntas
    const votes = { calm: 0, playful: 0, affectionate: 0 };
    if (home) votes[home]++;
    if (time) votes[time]++;
    if (activity) votes[activity]++;

    let temperament = 'calm';
    if (votes.playful >= votes.calm && votes.playful >= votes.affectionate) {
      temperament = 'playful';
    } else if (votes.affectionate >= votes.calm && votes.affectionate >= votes.playful) {
      temperament = 'affectionate';
    }

    // Mapear temperamento para perfis localizados
    const profiles = {
      calm: { name: 'Calmo', nameEn: 'Calm', nameEs: 'Tranquilo', i18n: 'gallery.tempCalm' },
      playful: { name: 'Brincalhão', nameEn: 'Playful', nameEs: 'Juguetón', i18n: 'gallery.tempPlayful' },
      affectionate: { name: 'Carinhoso', nameEn: 'Affectionate', nameEs: 'Cariñoso', i18n: 'gallery.tempAffectionate' }
    };

    const selectedProfile = profiles[temperament];
    const profileI18n = selectedProfile.i18n;
    const profileName = selectedProfile.name;

    // Announce result to screen readers via ARIA live region
    if (announcer && window.catloversTranslator) {
      const language = localStorage.getItem('preferred_language') || 'pt_BR';
      const prefix = window.catloversTranslator.translateForKey('quiz.announcerResult', language);
      const profileNameTrans = language === 'en_US' ? selectedProfile.nameEn : (language === 'es_ES' ? selectedProfile.nameEs : selectedProfile.name);
      announcer.textContent = `${prefix} ${profileNameTrans}.`;
    }

    const profile = document.createElement('span');
    profile.dataset.i18n = profileI18n;
    profile.textContent = profileName;
    resultProfile.replaceChildren(profile);
    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(localStorage.getItem('preferred_language') || 'pt_BR');
    }
    resultLink.href = `cats.html?temperament=${temperament}`;

    // Animação simples para mostrar o resultado
    form.classList.add('quiz-form--submitted');
    form.inert = true;
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('is-visible');
    resultDiv.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultDiv.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  });
});

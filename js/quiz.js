document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quiz-form');
  const resultDiv = document.getElementById('quiz-result');
  const resultProfile = document.getElementById('result-profile');
  const resultLink = document.getElementById('result-link');
  const announcer = document.getElementById('quiz-announcer');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

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

    resultProfile.innerHTML = `<span data-i18n="${profileI18n}">${profileName}</span>`;
    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(localStorage.getItem('preferred_language') || 'pt_BR');
    }
    resultLink.href = `cats.html?temperament=${temperament}`;

    // Animação simples para mostrar o resultado
    form.classList.add('quiz-form--submitted');
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('is-visible');
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quiz-form");
  const resultDiv = document.getElementById("quiz-result");
  const resultProfile = document.getElementById("result-profile");
  const resultLink = document.getElementById("result-link");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const home = formData.get("home");
    const time = formData.get("time");

    let temperament = "calm";
    let profileI18n = "gallery.tempCalm";
    let profileName = "Calmo";

    // Lógica simples de pontuação
    if (home === "playful" || time === "playful") {
      temperament = "playful";
      profileI18n = "gallery.tempPlayful";
      profileName = "Brincalhão";
    } else if (home === "affectionate" && time !== "calm") {
      temperament = "affectionate";
      profileI18n = "gallery.tempAffectionate";
      profileName = "Carinhoso";
    }

    resultProfile.innerHTML = `<span data-i18n="${profileI18n}">${profileName}</span>`;
    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(localStorage.getItem('preferred_language') || 'pt_BR');
    }
    resultLink.href = `cats.html`; // Na página da galeria a pessoa usa o filtro, ou poderíamos passar via query string `?temp=${temperament}`.
    
    // Animação simples para mostrar o resultado
    form.classList.add("quiz-form--submitted");
    resultDiv.style.display = "block";
    resultDiv.classList.add("is-visible");
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  });
});

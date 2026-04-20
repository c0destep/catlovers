import catsDataJson from '../cats.json';

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("cats-gallery");
  const filterAge = document.getElementById("filter-age");
  const filterSex = document.getElementById("filter-sex");
  const filterTemperament = document.getElementById("filter-temperament");

  let catsData = [];

  const renderCats = (cats) => {
    gallery.innerHTML = "";
    if (cats.length === 0) {
      gallery.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: var(--color-text-muted);" data-i18n="gallery.empty">Nenhum gatinho encontrado com esses filtros.</p>`;
      if (window.catloversTranslator) {
        window.catloversTranslator.translatePageTo(localStorage.getItem('preferred_language') || 'pt_BR');
      }
      return;
    }

    cats.forEach(cat => {
      const card = document.createElement("article");
      card.className = "feature-card cat-card";
      
      const sexLabel = cat.sex === 'male' ? 'Macho' : 'Fêmea';
      const sexI18n = cat.sex === 'male' ? 'gallery.sexMale' : 'gallery.sexFemale';

      let tempLabel = cat.temperament;
      let tempI18n = 'gallery.tempCalm';
      if (tempLabel === 'calm') { tempLabel = 'Calmo'; tempI18n = 'gallery.tempCalm'; }
      if (tempLabel === 'playful') { tempLabel = 'Brincalhão'; tempI18n = 'gallery.tempPlayful'; }
      if (tempLabel === 'affectionate') { tempLabel = 'Carinhoso'; tempI18n = 'gallery.tempAffectionate'; }

      card.innerHTML = `
        <img src="${cat.image}" alt="Foto de ${cat.name}" class="cat-card__image">
        <div class="cat-card__content">
          <h3 class="feature-card__title cat-card__title">${cat.name}</h3>
          <p class="feature-card__text cat-card__info">${cat.ageLabel} • <span data-i18n="${sexI18n}">${sexLabel}</span></p>
          <div class="cat-card__tags">
            <span class="feature-tag" data-i18n="gallery.colors.${cat.color}">${cat.color}</span>
            <span class="feature-tag" data-i18n="${tempI18n}">${tempLabel}</span>
          </div>
          <a href="adoption.html" class="button button--primary button--full-width" data-i18n="hero.ctaPrimary">Quero Adotar</a>
        </div>
      `;
      gallery.appendChild(card);
    });

    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(localStorage.getItem('preferred_language') || 'pt_BR');
    }
  };

  const applyFilters = () => {
    let filtered = catsData;
    if (filterAge.value !== "all") {
      filtered = filtered.filter(cat => cat.age === filterAge.value);
    }
    if (filterSex.value !== "all") {
      filtered = filtered.filter(cat => cat.sex === filterSex.value);
    }
    if (filterTemperament.value !== "all") {
      filtered = filtered.filter(cat => cat.temperament === filterTemperament.value);
    }
    renderCats(filtered);
  };

  catsData = catsDataJson;
  renderCats(catsData);

  filterAge.addEventListener("change", applyFilters);
  filterSex.addEventListener("change", applyFilters);
  filterTemperament.addEventListener("change", applyFilters);
});

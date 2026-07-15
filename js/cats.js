import catsDataJson from '../cats.json';

// Constants for better performance and maintainability
const SEX_LABELS = {
  male: { label: 'Macho', i18n: 'gallery.sexMale' },
  female: { label: 'Fêmea', i18n: 'gallery.sexFemale' }
};

const TEMPERAMENT_LABELS = {
  calm: { label: 'Calmo', i18n: 'gallery.tempCalm' },
  playful: { label: 'Brincalhão', i18n: 'gallery.tempPlayful' },
  affectionate: { label: 'Carinhoso', i18n: 'gallery.tempAffectionate' }
};

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('cats-gallery');
  const filterAge = document.getElementById('filter-age');
  const filterSex = document.getElementById('filter-sex');
  const filterTemperament = document.getElementById('filter-temperament');
  const announcer = document.getElementById('gallery-announcer');

  let catsData = [];


  const renderCats = (cats) => {
    // Clear gallery efficiently
    gallery.textContent = '';

    if (cats.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'gallery-empty';
      emptyMessage.dataset.i18n = 'gallery.empty';
      emptyMessage.textContent = 'Nenhum gatinho encontrado com esses filtros.';
      gallery.appendChild(emptyMessage);

      if (window.catloversTranslator) {
        window.catloversTranslator.translatePageTo(localStorage.getItem('preferred_language') || 'pt_BR');
      }
      return;
    }

    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();

    cats.forEach(cat => {
      const card = document.createElement('article');
      card.className = 'feature-card cat-card';
      card.setAttribute('role', 'listitem');
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = 'adoption.html';
      });

      const sexInfo = SEX_LABELS[cat.sex] || SEX_LABELS.female; // fallback
      const tempInfo = TEMPERAMENT_LABELS[cat.temperament] || TEMPERAMENT_LABELS.calm; // fallback

      // Create image element
      const img = document.createElement('img');
      img.src = cat.image;
      img.alt = `Foto de ${cat.name}`;
      img.className = 'cat-card__image';
      img.loading = 'lazy';

      // Create content div
      const contentDiv = document.createElement('div');
      contentDiv.className = 'cat-card__content';

      // Create title
      const title = document.createElement('h3');
      title.className = 'feature-card__title cat-card__title';
      title.textContent = cat.name;

      // Create info paragraph
      const infoP = document.createElement('p');
      infoP.className = 'feature-card__text cat-card__info';
      infoP.innerHTML = `${cat.ageLabel} • <span data-i18n="${sexInfo.i18n}">${sexInfo.label}</span>`;

      // Create tags div
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'cat-card__tags';

      // Color tag
      const colorTag = document.createElement('span');
      colorTag.className = 'feature-tag';
      colorTag.dataset.i18n = `gallery.colors.${cat.color}`;
      colorTag.textContent = cat.color;

      // Temperament tag
      const tempTag = document.createElement('span');
      tempTag.className = 'feature-tag';
      tempTag.dataset.i18n = tempInfo.i18n;
      tempTag.textContent = tempInfo.label;

      // Assemble elements
      tagsDiv.appendChild(colorTag);
      tagsDiv.appendChild(tempTag);

      contentDiv.appendChild(title);
      contentDiv.appendChild(infoP);
      contentDiv.appendChild(tagsDiv);

      // Create button
      const button = document.createElement('a');
      button.href = 'adoption.html';
      button.className = 'button button--primary button--full-width';
      button.dataset.i18n = 'hero.ctaPrimary';
      button.textContent = 'Quero Adotar';

      contentDiv.appendChild(button);

      // Assemble card
      card.appendChild(img);
      card.appendChild(contentDiv);

      fragment.appendChild(card);
    });

    gallery.appendChild(fragment);

    // Announce results to screen readers
    if (announcer && window.catloversTranslator) {
      const language = localStorage.getItem('preferred_language') || 'pt_BR';
      const count = cats.length;
      if (count === 0) {
        announcer.textContent = window.catloversTranslator.translateForKey('gallery.announcerEmpty', language);
      } else if (count === 1) {
        announcer.textContent = window.catloversTranslator.translateForKey('gallery.announcerFoundSingle', language);
      } else {
        announcer.textContent = `${count} ${window.catloversTranslator.translateForKey('gallery.announcerFoundPlural', language)}`;
      }
    }

    if (window.catloversTranslator) {
      window.catloversTranslator.translatePageTo(localStorage.getItem('preferred_language') || 'pt_BR');
    }
  };

  const applyFilters = () => {
    // Show loading state
    gallery.classList.add('features-grid--loading');
    gallery.setAttribute('aria-busy', 'true');

    // Use requestAnimationFrame to ensure UI updates before filtering
    requestAnimationFrame(() => {
      let filtered = catsData;
      if (filterAge.value !== 'all') {
        filtered = filtered.filter(cat => cat.age === filterAge.value);
      }
      if (filterSex.value !== 'all') {
        filtered = filtered.filter(cat => cat.sex === filterSex.value);
      }
      if (filterTemperament.value !== 'all') {
        filtered = filtered.filter(cat => cat.temperament === filterTemperament.value);
      }

      // Remove loading state
      gallery.classList.remove('features-grid--loading');
      gallery.removeAttribute('aria-busy');

      renderCats(filtered);
    });
  };

  catsData = catsDataJson;

  // Verificar se há filtro de temperamento na query string da URL (integração com Quiz)
  const urlParams = new URLSearchParams(window.location.search);
  const tempParam = urlParams.get('temperament');
  if (tempParam && ['calm', 'playful', 'affectionate'].includes(tempParam)) {
    filterTemperament.value = tempParam;
    
    // Executar filtro inicial baseado no parâmetro da URL
    let filtered = catsData.filter(cat => cat.temperament === tempParam);
    renderCats(filtered);
  } else {
    renderCats(catsData);
  }

  filterAge.addEventListener('change', applyFilters);
  filterSex.addEventListener('change', applyFilters);
  filterTemperament.addEventListener('change', applyFilters);
});

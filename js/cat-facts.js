const showCatFact = async (language) => {
  document.querySelector('.cat-fact')?.remove();

  // The API only supports English. Hide the fact section for other languages.
  if (language !== 'en_US') return;

  const footerCopyright = document.querySelector('.footer--copyright');
  if (!footerCopyright) return;

  const factDiv = document.createElement('div');
  factDiv.className = 'cat-fact';
  factDiv.innerHTML = '<strong>Cat Fact:</strong> <span id="cat-fact-text">Fetching...</span>';

  // Inserir antes dos direitos autorais
  footerCopyright.parentNode.insertBefore(factDiv, footerCopyright);

  const factText = document.getElementById('cat-fact-text');
  const CACHE_KEY = 'cat_fact_cached';
  const CACHE_TIME_KEY = 'cat_fact_time';
  const ONE_HOUR = 60 * 60 * 1000;

  const cachedFact = sessionStorage.getItem(CACHE_KEY);
  const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
  const now = Date.now();

  if (cachedFact && cachedTime && now - parseInt(cachedTime, 10) < ONE_HOUR) {
    factText.textContent = cachedFact;
    return;
  }

  try {
    const response = await fetch('https://catfact.ninja/fact', {
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`Cat fact request failed with status ${response.status}`);

    const data = await response.json();
    if (typeof data.fact !== 'string' || data.fact.trim() === '') {
      throw new Error('Cat fact response did not contain a fact');
    }

    factText.textContent = data.fact;
    sessionStorage.setItem(CACHE_KEY, data.fact);
    sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
  } catch {
    factText.textContent = 'The cat fact is unavailable. Try again when you are online.';
    factDiv.dataset.state = 'unavailable';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let language = 'pt_BR';
  try {
    language = window.localStorage.getItem('preferred_language') || language;
  } catch {
    // The fact section keeps its default language when storage is unavailable.
  }
  showCatFact(language);
});

document.addEventListener('catlovers:languagechange', (event) => {
  showCatFact(event.detail.language);
});

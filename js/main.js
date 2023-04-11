const portuguese = require("../languages/pt_BR.json")
const english = require("../languages/en_US.json")

const translator = new Translator({
  defaultLanguage: 'pt_BR',
  detectLanguage: true,
  persist: true,
  persistKey: 'preferred_language'
});

translator.add('pt_BR', portuguese).add('en_US', english).translatePageTo('pt_BR')

window.onscroll = () => {
  backToTop()
}

// TODO Fazer um seletor de idiomas

/*for (let button of document.querySelectorAll('button')) {
  button.addEventListener('click', (evt) => {
    translator.translatePageTo(evt.target.dataset.lang)
  })
}*/

function backToTop() {
  if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
    document.getElementById("backTop").classList.add('page-top__visible');
  } else {
    document.getElementById("backTop").classList.remove('page-top__visible');
  }
}

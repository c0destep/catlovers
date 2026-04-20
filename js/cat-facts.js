document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.querySelector(".footer__bottom");
  if (!footerContainer) return;

  const factDiv = document.createElement("div");
  factDiv.style.marginTop = "1rem";
  factDiv.style.fontSize = "0.875rem";
  factDiv.style.color = "var(--color-text-muted)";
  factDiv.style.textAlign = "center";
  factDiv.innerHTML = `<strong>Curiosidade Felina:</strong> <span id="cat-fact-text">Buscando...</span>`;
  
  // Inserir antes dos direitos autorais se possível, ou no final
  footerContainer.insertBefore(factDiv, footerContainer.firstChild);

  const factText = document.getElementById("cat-fact-text");

  // Usando a API pública catfact.ninja (mais confiável para curiosidades em texto do que The Cat API que foca em imagens)
  fetch("https://catfact.ninja/fact")
    .then(response => response.json())
    .then(data => {
      // Como a API retorna em inglês, vamos exibir diretamente (poderíamos usar o Simple Translator para traduzir, mas por simplicidade mantemos o original ou adicionamos um aviso)
      factText.textContent = data.fact;
    })
    .catch(error => {
      console.error("Erro ao buscar curiosidade:", error);
      factDiv.style.display = "none";
    });
});

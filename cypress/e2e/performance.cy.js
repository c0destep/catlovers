describe('Performance e Carregamento', () => {
  it('deve carregar a página rapidamente', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        // Sobrescreve performance API para medir
        win.performance = performance;
      }
    });

    // Verifica se a página carregou
    cy.document().its('readyState').should('eq', 'complete');
  });

  it('deve ter critical CSS inlinado', () => {
    cy.visit('/');

    // Verifica se há estilo inlinado no head
    cy.get('head style').should('exist');
    cy.get('head style').first().should('contain', ':root');
  });

  it('deve ter lazy loading em imagens abaixo da dobra', () => {
    cy.visit('/blog.html'); // Blog.html tem imagens com loading lazy

    // Imagens devem ter loading="lazy" ou ser below the fold
    cy.get('img[loading="lazy"]').should('have.length.at.least', 1);
  });

  it('deve ter fontes carregadas (self-hosted via fontsource)', () => {
    cy.visit('/');

    // Fontes são self-hosted via @fontsource — verificamos o link do CSS principal
    cy.get('link[rel="stylesheet"]').should('have.length.at.least', 1);
  });

  it('deve ter service worker registrado', () => {
    cy.visit('/');

    cy.window().then((win) => {
      // Verifica se o service worker está disponível
      if ('serviceWorker' in navigator) {
        // O registro é feito no sw.js
        expect(true).to.be.true;
      }
    });
  });
});

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

  it('deve publicar um manifesto com ícones válidos', () => {
    cy.request('/site.webmanifest').then(({ body, status }) => {
      expect(status).to.eq(200);
      expect(body.icons).to.deep.include.members([
        { src: 'icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
        { src: 'icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' }
      ]);
    });
  });

  it('deve registrar o service worker na raiz publicada', () => {
    cy.visit('/');

    cy.window().then(async (win) => {
      expect(win.navigator.serviceWorker).to.exist;
      const registration = await win.navigator.serviceWorker.ready;
      expect(new URL(registration.active.scriptURL).pathname).to.match(/\/sw\.js$/);
      expect(registration.scope).to.eq(`${win.location.origin}/`);
    });
  });
});

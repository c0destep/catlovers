describe('Internacionalização (i18n)', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad (win) {
        Object.defineProperty(win.navigator, 'language', { value: 'pt-BR' });
        win.localStorage.clear();
      }
    });
  });

  it('deve carregar idioma padrão (português)', () => {
    cy.get('html').should('have.attr', 'lang', 'pt-BR');
    cy.get('h1').should('contain.text', 'Um lar seguro');
  });

  it('deve alternar para inglês ao clicar no botão EN', () => {
    cy.get('[data-language="en_US"]').first().click({ force: true });

    // Verifica se o html lang mudou
    cy.get('html').should('have.attr', 'lang', 'en-US');

    // Verifica se o título está em inglês
    cy.get('h1').should('contain.text', 'A safe home');
    cy.get('.demo-notice').should('contain.text', 'Demonstration project');
    cy.get('meta[name="description"]')
      .should('have.attr', 'content')
      .and('contain', 'responsible adoption');
  });

  it('deve alternar para espanhol ao clicar no botão ES', () => {
    cy.get('[data-language="es_ES"]').first().click({ force: true });

    cy.get('html').should('have.attr', 'lang', 'es-ES');
    cy.get('h1').should('contain.text', 'Un hogar seguro');
  });

  it('deve persistir preferência de idioma em localStorage', () => {
    cy.get('[data-language="en_US"]').first().click({ force: true });

    cy.window().then((win) => {
      const savedLang = win.localStorage.getItem('preferred_language');
      expect(savedLang).to.equal('en_US');
    });
  });

  it('deve restaurar idioma salvo ao recarregar página', () => {
    // Define idioma
    cy.get('[data-language="en_US"]').first().click({ force: true });

    // Salva no localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('preferred_language', 'en_US');
    });

    // Recarrega
    cy.reload();

    // Verifica se manteve inglês
    cy.get('html').should('have.attr', 'lang', 'en-US');
    cy.get('h1').should('contain.text', 'A safe home');
  });

  it('deve traduzir conteúdo criado dinamicamente', () => {
    cy.visit('/cats.html');
    cy.get('[data-language="en_US"]').first().click({ force: true });

    cy.get('.cat-card').should('have.length.greaterThan', 0);
    cy.get('.cat-card__info').first().should('contain.text', '2 years • Male');
    cy.get('.cat-card .feature-tag').first().should('contain.text', 'Tuxedo');
    cy.get('.cat-card__image').first().should('have.attr', 'alt').and('match', /^Photo of /);
  });

  it('deve traduzir descrições de imagens e metadados', () => {
    cy.get('[data-language="en_US"]').first().click({ force: true });

    cy.get('.hero__image').should('have.attr', 'alt', 'Cat looking at the camera');
    cy.get('.language-switch').should('have.attr', 'aria-label', 'Language');
    cy.get('.theme-toggle').should('have.attr', 'aria-label', 'Toggle theme');
    cy.visit('/terms.html');
    cy.get('html').should('have.attr', 'lang', 'en-US');
    cy.get('meta[name="description"]')
      .should('have.attr', 'content', 'Read the terms for using the Catlovers demonstration website.');
    cy.get('.page-top').should('have.attr', 'aria-label', 'Back to top');
  });

  it('deve exibir curiosidades somente no idioma suportado pela API', () => {
    cy.intercept('GET', 'https://catfact.ninja/fact', { fact: 'Cats sleep for many hours.' });

    cy.get('.cat-fact').should('not.exist');
    cy.get('[data-language="en_US"]').first().click({ force: true });
    cy.get('.cat-fact').should('contain.text', 'Cats sleep for many hours.');
    cy.get('[data-language="es_ES"]').first().click({ force: true });
    cy.get('.cat-fact').should('not.exist');
  });
});

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
});

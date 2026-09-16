describe('Acessibilidade e Navegação', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('preferred_language', 'pt_BR');
      }
    });
  });

  it('deve ter skip link funcional', () => {
    cy.get('.skip-link')
      .should('have.attr', 'href', '#main-content')
      .click({ force: true });
    cy.url().should('include', '#main-content');
  });

  it('deve ter landmarks ARIA corretos', () => {
    cy.get('main').should('exist');
    cy.get('nav').should('exist');
    cy.get('header').should('exist');
    cy.get('footer').should('exist');
  });

  it('deve ter títulos hierárquicos corretos', () => {
    cy.get('h1').should('have.length', 1);
    cy.get('h2').should('have.length.at.least', 1);
  });

  it('deve ter atributos alt em todas as imagens do hero', () => {
    cy.get('.hero__image')
      .should('have.attr', 'alt')
      .and('not.be.empty');
  });

  it('deve controlar o menu móvel por teclado e restaurar o foco', () => {
    cy.viewport(375, 667);

    cy.get('.navbar__toggle--button')
      .focus()
      .type('{enter}')
      .should('have.attr', 'aria-expanded', 'true')
      .and('have.attr', 'aria-label', 'Fechar menu');

    cy.get('.menu__link').first()
      .should('have.focus')
      .type('{esc}');

    cy.get('.navbar__toggle--button')
      .should('have.focus')
      .and('have.attr', 'aria-expanded', 'false')
      .and('have.attr', 'aria-label', 'Abrir menu');
    cy.get('nav').should('not.have.class', 'navbar--open');
  });
});

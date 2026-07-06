describe('Acessibilidade e Navegação', () => {
  beforeEach(() => {
    cy.visit('/');
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
});

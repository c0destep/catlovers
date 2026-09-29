describe('Galeria de Gatos', () => {
  beforeEach(() => {
    cy.visit('/cats.html');
  });

  it('deve carregar a galeria de gatos', () => {
    cy.get('h1[data-i18n="gallery.title"]').should('be.visible');
    cy.get('#cats-gallery').should('exist');
  });

  it('deve exibir cards de gatos', () => {
    cy.get('.cat-card').should('have.length.at.least', 1);
  });

  it('deve ter filtros de busca funcionais', () => {
    cy.get('#filter-age').select('kitten').should('have.value', 'kitten');

    cy.get('.cat-card')
      .should('have.length', 2)
      .then(($cards) => {
        const names = [...$cards].map((card) => card.querySelector('.cat-card__title')?.textContent);
        expect(names).to.deep.equal(['Nala', 'Luna']);
      });
  });

  it('deve oferecer um único link por card sem tornar o article um controle', () => {
    cy.get('.cat-card').each(($card) => {
      cy.wrap($card)
        .should('have.attr', 'role', 'listitem');
      cy.wrap($card)
        .should('not.have.attr', 'tabindex');
      cy.wrap($card)
        .should('not.have.attr', 'style');

      cy.wrap($card)
        .find('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        .should('have.length', 1)
        .and('match', 'a.cat-card__link')
        .and('have.attr', 'href', 'adoption.html');
    });
  });

  it('deve receber foco por Tab e abrir a adoção com Enter', () => {
    cy.get('.cat-card').first().as('card');
    cy.get('#filter-temperament').focus().should('have.focus');
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.get('@card').find('.cat-card__link').should('have.focus');
    cy.get('@card')
      .should('have.css', 'outline-style', 'solid')
      .and('have.css', 'outline-width', '3px');

    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.location('pathname').should('match', /\/adoption\.html$/);
  });

  it('deve abrir a adoção ao clicar na imagem, fora da chamada visual', () => {
    cy.get('.cat-card').first().find('.cat-card__image').click();
    cy.location('pathname').should('match', /\/adoption\.html$/);
  });

  it('deve ter imagens com alt text', () => {
    cy.get('.cat-card__image').should('have.attr', 'alt');
  });
});

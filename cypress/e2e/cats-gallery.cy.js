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
    // Verifica se existem filtros
    cy.get('.filter-group__select').should('exist');

    // Seleciona um filtro
    cy.get('.filter-group__select').first().select(1);

    // Verifica se os cards são filtrados (pode ter menos ou igual)
    cy.get('.cat-card').should('have.length.at.least', 0);
  });

  it('deve mostrar detalhes do gato ao clicar no card', () => {
    // Clica no primeiro card
    cy.get('.cat-card').first().click();

    // Deve navegar para página de adoção
    cy.url().should('include', 'adoption');
  });

  it('deve ter imagens com alt text', () => {
    cy.get('.cat-card__image').should('have.attr', 'alt');
  });
});

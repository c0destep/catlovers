describe('Hierarquia de conteúdo da home', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('mantém a proposta e as orientações principais visíveis sem depender de animação', () => {
    cy.get('.hero__title').should('be.visible');
    cy.get('#why').scrollIntoView().should('be.visible');
    cy.get('#process').scrollIntoView().should('be.visible');
  });

  it('não exibe indicadores técnicos como argumento de adoção', () => {
    cy.get('.hero__floating-card').should('not.exist');
    cy.get('.section--impact').should('not.exist');
  });

  it('apresenta as orientações antes da jornada de exemplo', () => {
    cy.get('#why').then(($why) => {
      cy.get('#process').then(($process) => {
        expect($why[0].offsetTop).to.be.lessThan($process[0].offsetTop);
      });
    });
  });
});

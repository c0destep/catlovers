describe('Animações de Scroll', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve ter elementos com classe animate-on-scroll', () => {
    cy.get('.animate-on-scroll').should('have.length.at.least', 1);
  });

  it('deve adicionar classe is-visible quando elemento entra na viewport', () => {
    // Vai para uma seção que tem animação
    cy.get('.section--impact').scrollIntoView();

    // Espera pela animação (IntersectionObserver)
    cy.get('.section--impact')
      .should('have.class', 'is-visible')
      .and('be.visible');
  });

  it('deve aplicar stagger animation nos children', () => {
    // Vai para seção com stagger-children
    cy.get('#why').scrollIntoView();

    // Verifica se os cards têm animação escalonada
    cy.get('.features-grid .feature-card').should('have.length.at.least', 1);

    // Cada card deve ter opacity 1 após animação
    cy.get('.features-grid .feature-card').first()
      .should('have.css', 'opacity', '1');
  });

  it('deve ter elementos flutuando com animação', () => {
    cy.get('.hero__floating-card').first()
      .should('be.visible')
      .and('have.css', 'position', 'absolute');
  });
});

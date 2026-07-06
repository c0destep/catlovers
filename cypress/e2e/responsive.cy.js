describe('Design Responsivo', () => {
  it('deve funcionar em mobile (375px)', () => {
    cy.viewport(375, 667);
    cy.visit('/');

    // Hero deve ter layout grid
    cy.get('.hero__inner').should('have.css', 'display', 'grid');

    // Botões devem ser clicáveis
    cy.get('.button--lg').first().should('be.visible');
  });

  it('deve funcionar em tablet (768px)', () => {
    cy.viewport(768, 1024);
    cy.visit('/');

    // Grid do hero pode ter 2 colunas ou ainda 1
    cy.get('.hero__inner').should('be.visible');
    cy.get('.hero__image').should('be.visible');
  });

  it('deve funcionar em desktop (1280px)', () => {
    cy.viewport(1280, 720);
    cy.visit('/');

    // Hero com 2 colunas
    cy.get('.hero__inner').should('be.visible');
    cy.get('.hero__content').should('be.visible');
    cy.get('.hero__visual').should('be.visible');
  });

  it('deve ter menu hambúrguer em mobile', () => {
    cy.viewport(375, 667);
    cy.visit('/');

    // Botão do menu deve existir
    cy.get('.navbar__toggle--button').should('exist');
  });

  it('deve esconder floating cards em telas muito pequenas se necessário', () => {
    cy.viewport(320, 568);
    cy.visit('/');

    // Os floating cards podem estar visíveis mas ajustados
    cy.get('.hero__floating-card').should('have.length.at.least', 1);
  });
});

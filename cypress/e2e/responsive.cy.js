describe('Design Responsivo', () => {
  const expectNoHorizontalScroll = () => {
    cy.window().then((win) => {
      win.scrollTo({ left: 100, top: 0 });
      expect(win.scrollX).to.equal(0);
    });
  };

  it('deve funcionar em mobile (375px)', () => {
    cy.viewport(375, 667);
    cy.visit('/');

    // Hero deve ter layout grid
    cy.get('.hero__inner').should('have.css', 'display', 'grid');

    // Botões devem ser clicáveis
    cy.get('.button--lg').first().should('be.visible');
    expectNoHorizontalScroll();
  });

  it('deve funcionar em tablet (768px)', () => {
    cy.viewport(768, 1024);
    cy.visit('/');

    // Grid do hero pode ter 2 colunas ou ainda 1
    cy.get('.hero__inner').should('be.visible');
    cy.get('.hero__image').should('be.visible');
    expectNoHorizontalScroll();
  });

  it('deve funcionar em desktop (1280px)', () => {
    cy.viewport(1280, 720);
    cy.visit('/');

    // Hero com 2 colunas
    cy.get('.hero__inner').should('be.visible');
    cy.get('.hero__content').should('be.visible');
    cy.get('.hero__visual').should('be.visible');
    expectNoHorizontalScroll();
  });

  it('deve ter menu hambúrguer em mobile', () => {
    cy.viewport(375, 667);
    cy.visit('/');

    // Botão do menu deve existir
    cy.get('.navbar__toggle--button').should('exist');
  });

  it('deve manter a imagem principal dentro da viewport em telas pequenas', () => {
    cy.viewport(320, 568);
    cy.visit('/');

    cy.get('.hero__visual').should('be.visible');
    cy.get('.hero__image').then(($image) => {
      expect($image[0].getBoundingClientRect().right).to.be.at.most(320);
    });
    expectNoHorizontalScroll();
  });

  it('deve manter filtros e cards da galeria dentro da viewport em 320px', () => {
    cy.viewport(320, 568);
    cy.visit('/cats.html');

    cy.get('.filter-group__select').each(($select) => {
      expect($select[0].getBoundingClientRect().right).to.be.at.most(296);
    });
    cy.get('.cat-card').first().then(($card) => {
      expect($card[0].getBoundingClientRect().right).to.be.at.most(296);
    });
    expectNoHorizontalScroll();
  });

  it('deve organizar filtros e galeria em colunas previsíveis a partir de 640px', () => {
    cy.viewport(640, 800);
    cy.visit('/cats.html');

    cy.get('.filter-group').then(($filters) => {
      expect($filters[0].getBoundingClientRect().top).to.equal($filters[1].getBoundingClientRect().top);
      expect($filters[1].getBoundingClientRect().top).to.equal($filters[2].getBoundingClientRect().top);
    });
    cy.get('.cat-card').then(($cards) => {
      expect($cards[0].getBoundingClientRect().top).to.equal($cards[1].getBoundingClientRect().top);
    });
    expectNoHorizontalScroll();
  });
});

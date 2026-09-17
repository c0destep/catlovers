describe('Consistência das páginas secundárias', () => {
  it('mantém os heróis com imagem em proporção editorial', () => {
    cy.viewport(1280, 800);
    cy.visit('/about.html');

    cy.get('.hero__media .hero__image').then(($image) => {
      const { width, height } = $image[0].getBoundingClientRect();
      expect(width / height).to.be.closeTo(1.5, 0.02);
    });
  });

  it('não reserva uma coluna vazia nos heróis das páginas legais', () => {
    cy.viewport(1280, 800);

    for (const page of ['/privacy.html', '/terms.html']) {
      cy.visit(page);
      cy.get('.hero--text-only .hero__grid').should('have.css', 'grid-template-columns').then((columns) => {
        expect(columns.split(' ')).to.have.length(1);
      });
    }
  });

  it('usa mídia editorial consistente nos cards do blog', () => {
    cy.visit('/blog.html');

    cy.get('.blog-card').should('have.length', 3);
    cy.get('.blog-card > img.blog-card__media').should('have.length', 3);
    cy.get('.blog-card__media').each(($media) => {
      expect($media.attr('width')).to.match(/^\d+$/);
      expect($media.attr('height')).to.match(/^\d+$/);
    });
  });

  it('preserva degraus visuais entre superfícies no tema escuro', () => {
    const visitInDarkMode = (page) => {
      cy.visit(page);
      cy.window().then((win) => {
        win.localStorage.setItem('preferred_theme', 'dark');
      });
      cy.reload();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    };

    visitInDarkMode('/benefits.html');
    cy.get('body').invoke('css', 'background-color').then((background) => {
      cy.get('.section--alt').first().invoke('css', 'background-color').should('not.equal', background);
    });

    visitInDarkMode('/quiz.html');
    cy.get('body').invoke('css', 'background-color').then((background) => {
      cy.get('.quiz-container').invoke('css', 'background-color').should('not.equal', background);
    });
  });
});

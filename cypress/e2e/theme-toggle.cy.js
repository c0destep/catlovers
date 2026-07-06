describe('Toggle de Tema (Dark/Light)', () => {
  beforeEach(() => {
    cy.visit('/');
    // Limpa localStorage para garantir estado inicial
    cy.clearLocalStorage();
    cy.reload();
  });

  it('deve iniciar com tema baseado na preferência do sistema ou padrão', () => {
    // O tema deve estar aplicado (light ou dark)
    cy.get('html').should('have.attr', 'data-theme');
  });

  it('deve alternar entre temas ao clicar no botão', function () {
    // Captura tema inicial
    cy.get('html')
      .invoke('attr', 'data-theme')
      .as('initialTheme');

    // Clica no botão de toggle
    cy.get('.theme-toggle').click();

    // Verifica se o tema mudou
    cy.get('html')
      .invoke('attr', 'data-theme')
      .should('not.eq', this.initialTheme);
  });

  it('deve persistir preferência de tema em localStorage', () => {
    // Clica no botão
    cy.get('.theme-toggle').click();

    // Verifica se salvou no localStorage
    cy.window().then((win) => {
      const savedTheme = win.localStorage.getItem('preferred_theme');
      expect(savedTheme).to.exist;
      expect(['light', 'dark']).to.include(savedTheme);
    });
  });

  it('deve aplicar tema salvo ao recarregar página', () => {
    // Define um tema
    cy.get('html').invoke('attr', 'data-theme', 'dark');
    cy.window().then((win) => {
      win.localStorage.setItem('preferred_theme', 'dark');
    });

    // Recarrega
    cy.reload();

    // Verifica se o tema foi mantido
    cy.get('html').should('have.attr', 'data-theme', 'dark');
  });
});

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
    cy.get('html').should('have.css', 'color-scheme', 'dark');
    cy.get('body')
      .should('have.css', 'background-color', 'rgb(26, 24, 22)')
      .and('have.css', 'color', 'rgb(245, 240, 232)');
  });
});

describe('Toggle de Tema sem localStorage', () => {
  it('carrega e alterna o tema quando localStorage lança SecurityError', () => {
    let initialTheme;

    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win, 'localStorage', {
          configurable: true,
          get() {
            throw new win.DOMException('The operation is insecure.', 'SecurityError');
          }
        });
      }
    });

    cy.get('html')
      .invoke('attr', 'data-theme')
      .then((theme) => {
        initialTheme = theme;
        expect(['light', 'dark']).to.include(initialTheme);
      });

    cy.get('.theme-toggle')
      .invoke('attr', 'aria-pressed')
      .then((ariaPressed) => {
        expect(ariaPressed).to.equal(initialTheme === 'dark' ? 'true' : 'false');
      });

    cy.get('.theme-toggle').click();

    cy.get('html')
      .invoke('attr', 'data-theme')
      .then((theme) => {
        const expectedTheme = initialTheme === 'dark' ? 'light' : 'dark';
        expect(theme).to.equal(expectedTheme);
        cy.get('.theme-toggle').should('have.attr', 'aria-pressed', expectedTheme === 'dark' ? 'true' : 'false');
      });
  });
});

describe('Toggle de Tema sem matchMedia', () => {
  it('carrega no tema claro e alterna quando matchMedia não existe', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        Object.defineProperty(win, 'matchMedia', {
          configurable: true,
          value: undefined
        });
      }
    });

    cy.get('html').should('have.attr', 'data-theme', 'light');
    cy.get('.theme-toggle').should('have.attr', 'aria-pressed', 'false').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('.theme-toggle').should('have.attr', 'aria-pressed', 'true');
  });
});

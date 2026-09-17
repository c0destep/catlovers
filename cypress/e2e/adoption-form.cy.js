describe('Adoção Page', () => {
  beforeEach(() => {
    cy.visit('/adoption.html', {
      onBeforeLoad(win) {
        win.localStorage.setItem('preferred_language', 'pt_BR');
      }
    });
  });

  it('deve carregar o formulário de adoção corretamente', () => {
    cy.get('.demo-notice').should('be.visible').and('contain.text', 'Projeto demonstrativo');
    cy.get('h2[data-i18n="form.title"]').scrollIntoView().should('be.visible');
    cy.get('form#adoption-form').should('be.visible');
  });

  it('deve exibir erros de validação ao enviar formulário vazio', () => {
    cy.get('form#adoption-form button').click();
    
    // O campo deve ficar inválido
    cy.get('#name').should('have.attr', 'aria-invalid', 'true');
    cy.get('#name-error').should('not.be.empty');
    
    cy.get('#email').should('have.attr', 'aria-invalid', 'true');
    cy.get('#email-error').should('not.be.empty');
  });

  it('deve validar o formulário sem afirmar que os dados foram enviados', () => {
    cy.get('#name').type('Lucas Alves');
    cy.get('#email').type('lucas@example.com');
    
    cy.get('form#adoption-form button').click();
    
    cy.get('form#adoption-form button')
      .should('have.attr', 'data-i18n', 'form.success')
      .and('have.class', 'button--success');
    cy.get('#name').should('have.value', '');
    cy.get('#email').should('have.value', '');
  });

  it('deve remover o estado de sucesso ao iniciar uma nova tentativa inválida', () => {
    cy.get('#name').type('Lucas Alves');
    cy.get('#email').type('lucas@example.com');
    cy.get('form#adoption-form button').click().should('have.class', 'button--success');

    cy.get('form#adoption-form button').click()
      .should('not.have.class', 'button--success')
      .and('have.attr', 'data-i18n', 'form.submit');
    cy.get('#name').should('have.attr', 'aria-invalid', 'true');
  });
});

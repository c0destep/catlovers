describe('Adoção Page', () => {
  beforeEach(() => {
    // Acessar a página de adoção localmente
    cy.visit('/adoption.html');
  });

  it('deve carregar o formulário de adoção corretamente', () => {
    cy.get('h2[data-i18n="form.title"]').should('be.visible');
    cy.get('form#adoption-form').should('be.visible');
  });

  it('deve exibir erros de validação ao enviar formulário vazio', () => {
    cy.get('form#adoption-form button[type="submit"]').click();
    
    // O campo deve ficar inválido
    cy.get('#name').should('have.attr', 'aria-invalid', 'true');
    cy.get('#name-error').should('not.be.empty');
    
    cy.get('#email').should('have.attr', 'aria-invalid', 'true');
    cy.get('#email-error').should('not.be.empty');
  });

  it('deve submeter o formulário quando preenchido corretamente', () => {
    cy.get('#name').type('Lucas Alves');
    cy.get('#email').type('lucas@example.com');
    
    cy.get('form#adoption-form button[type="submit"]').click();
    
    // Verifica se o texto do botão muda indicando sucesso
    cy.get('form#adoption-form button[type="submit"]')
      .should('contain.text', 'sucesso');
  });
});

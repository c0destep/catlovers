describe('Quiz de Raça de Gato', () => {
  beforeEach(() => {
    cy.visit('/quiz.html');
  });

  it('deve carregar a página do quiz corretamente', () => {
    cy.get('h1[data-i18n="quiz.title"]').should('be.visible');
    cy.get('#quiz-form').should('exist');
  });

  it('deve exibir todas as perguntas do quiz', () => {
    cy.get('.quiz-step').should('have.length.at.least', 1);
  });

  it('deve ter botões de rádio para cada opção', () => {
    cy.get('.quiz-step input[type="radio"]').should('have.length.at.least', 4);
  });

  it('deve mostrar resultado após submeter respostas', () => {
    // Seleciona uma opção para cada pergunta
    cy.get('#step-1 input[type="radio"]').first().check({ force: true });
    cy.get('#step-2 input[type="radio"]').first().check({ force: true });
    cy.get('#step-3 input[type="radio"]').first().check({ force: true });

    // Submete
    cy.get('#quiz-form button').click();

    // Deve mostrar o resultado
    cy.get('#quiz-result').should('be.visible').and('have.focus');
    cy.get('#quiz-form').should('have.prop', 'inert', true);
  });

  it('deve identificar e focar perguntas sem resposta', () => {
    cy.get('#quiz-form button').click();

    cy.get('#quiz-result').should('not.be.visible');
    cy.get('.quiz-step[aria-invalid="true"]').should('have.length', 3);
    cy.get('#step-1').should('have.focus');
    cy.get('#step-1-error')
      .should('have.attr', 'data-i18n', 'quiz.errorRequired')
      .and('not.be.empty');
  });

  it('deve nomear semanticamente os três grupos de respostas', () => {
    cy.get('fieldset.quiz-step').should('have.length', 3);
    cy.get('fieldset.quiz-step legend').should('have.length', 3);
  });
});

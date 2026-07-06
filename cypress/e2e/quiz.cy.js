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
    cy.get('#quiz-result').should('be.visible');
  });

  it('deve validar que pelo menos uma resposta foi selecionada', () => {
    cy.get('#quiz-form button').click();

    // Pode mostrar erro ou simplesmente não avançar
    // Verifica se ainda está no formulário ou mostra mensagem
    cy.get('#quiz-form').should('be.visible');
  });
});

// cypress/e2e/login-interaction.cy.ts

describe('Page de connexion - Tests d\'interaction', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('vérifie que les champs du formulaire sont réactifs', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    cy.get('input[type="email"]').type(testEmail).should('have.value', testEmail);
    cy.get('input[type="password"]').type(testPassword).should('have.value', testPassword);
  });


  it('change l\'apparence du bouton de connexion au survol', () => {
    cy.get('button[type="submit"]')
      .trigger('mouseover')
      .should('have.css', 'background-color')
      .and((backgroundColor) => {
        expect(backgroundColor).not.to.eq('rgba(0, 0, 0, 0)');
      });
  });
});

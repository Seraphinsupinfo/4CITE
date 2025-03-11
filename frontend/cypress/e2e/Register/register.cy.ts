// cypress/e2e/auth/register.cy.ts

describe('Page d\'inscription', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('devrait afficher tous les éléments du formulaire d\'inscription', () => {
    cy.contains('h2', 'Créez un compte').should('be.visible');
    cy.contains('p', 'Déjà un compte ?').should('be.visible');
    cy.contains('a', 'Connectez-vous').should('be.visible');

    cy.get('input[placeholder="Nom d\'utilisateur"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('have.length', 2);
    cy.get('button[type="submit"]').contains('S\'inscrire').should('be.visible');
  });

  it('devrait afficher une erreur quand les champs sont vides', () => {
    cy.get('button[type="submit"]').click();

    cy.contains('p.text-danger', 'Veuillez remplir tous les champs.').should('be.visible');
  });

  it('devrait afficher une erreur quand les mots de passe ne correspondent pas', () => {
    cy.get('input[placeholder="Nom d\'utilisateur"]').type('testuser');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password456');

    cy.get('button[type="submit"]').click();

    cy.contains('p.text-danger', 'Les mots de passe ne correspondent pas.').should('be.visible');
  });

  it('devrait permettre de naviguer vers la page de connexion', () => {
    cy.contains('a', 'Connectez-vous').click();

    cy.url().should('include', '/login');
  });

  it('devrait vérifier la validation du format de l\'email', () => {

    cy.get('input[placeholder="Nom d\'utilisateur"]').type('testuser');
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');


    cy.get('button[type="submit"]').click();

    cy.intercept('POST', '**/register').as('registerAttempt');
    cy.url().should('include', '/register');
  });

});

// cypress/e2e/login-performance.cy.ts

describe('Page de connexion - Tests de performance', () => {
  it('charge la page en moins de 3 secondes', () => {
    const start = Date.now();
    cy.visit('/login').then(() => {
      const end = Date.now();
      const loadTime = end - start;
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('répond rapidement lors de la saisie dans les champs', () => {
    cy.visit('/login');

    const start = Date.now();
    cy.get('input[type="email"]')
      .type('test@example.com', { delay: 0 })
      .then(() => {
        const end = Date.now();
        const typeTime = end - start - 15; // Soustraction d'un délai minimal pour la saisie
        expect(typeTime).to.be.lessThan(500);
      });
  });

  it('traite la soumission du formulaire rapidement', () => {
    cy.visit('/login');

    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token' }
    }).as('loginRequest');

    cy.intercept('GET', '**/users/me', {
      statusCode: 200,
      body: { id: 1, email: 'test@example.com', name: 'Test User' }
    }).as('userRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');

    const start = Date.now();
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest').then(() => {
      const end = Date.now();
      const processTime = end - start;
      expect(processTime).to.be.lessThan(1000);
    });
  });

  it('gère correctement un grand nombre d\'erreurs consécutives', () => {
    cy.visit('/login');

    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('failedLoginRequest');

    for (let i = 0; i < 15; i++) {
      cy.get('input[type="email"]').clear().type(`test${i}@example.com`);
      cy.get('input[type="password"]').clear().type(`password${i}`);
      cy.get('button[type="submit"]').click();
      cy.wait('@failedLoginRequest');
    }

    cy.get('p.text-danger').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
  });

  it('conserve sa réactivité après rechargement de page', () => {
    cy.visit('/login');
    cy.reload();

    const start = Date.now();
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').then(() => {
      const end = Date.now();
      const interactionTime = end - start;
      expect(interactionTime).to.be.lessThan(1000);
    });
  });
});

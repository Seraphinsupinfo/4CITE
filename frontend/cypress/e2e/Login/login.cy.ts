describe('Page de connexion - Tests de base', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('affiche le titre principal', () => {
    cy.get('h2.fw-bold').should('be.visible').and('contain', 'Bon retour parmi nous');
  });

  it('affiche le formulaire de connexion avec tous les champs requis', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible').and('contain', 'Se connecter');
  });

  it('affiche les liens vers la création de compte et mot de passe oublié', () => {
    cy.get('a[href="/register"]').should('be.visible').and('contain', 'Créer un compte');
    cy.get('p.text-muted').last().should('contain', 'Mot de passe oublié');
  });

  it('affiche une icône utilisateur', () => {
    cy.get('.bs-icon-circle svg.bi-person').should('be.visible');
  });

  it('affiche un message d\'erreur lorsque le formulaire est soumis vide', () => {
    cy.get('button[type="submit"]').click();
    cy.get('p.text-danger').should('be.visible').and('contain', 'Veuillez remplir tous les champs');
  });

  it('affiche un message d\'erreur lorsque seul l\'email est rempli', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('p.text-danger').should('be.visible').and('contain', 'Veuillez remplir tous les champs');
  });

  it('affiche un message d\'erreur lorsque seul le mot de passe est rempli', () => {
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.get('p.text-danger').should('be.visible').and('contain', 'Veuillez remplir tous les champs');
  });

  it('tente de se connecter avec des identifiants valides', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { token: 'fake-jwt-token', userId: 1 }
    }).as('loginRequest');

    // Remplir et soumettre le formulaire
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click({force: true});

    cy.wait('@loginRequest');

    cy.location('pathname', { timeout: 8000 }).should('eq', '/');
  });

  it('affiche une erreur avec des identifiants invalides', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('failedLoginRequest');

    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@failedLoginRequest');
    cy.get('p.text-danger').should('be.visible').and('contain', 'Email ou mot de passe incorrect');
  });
});

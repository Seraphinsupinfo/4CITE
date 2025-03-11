// cypress/e2e/login-navigation.cy.ts

describe('Page de connexion - Tests de navigation', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('redirige vers la page d\'accueil après une connexion réussie', () => {
    // 1. Intercepter la requête de login et retourner un token JWT valide
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicHNldWRvIjoiUnlhbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQxNjg2MzgzLCJleHAiOjE3NDE3NzI3ODN9.n44Dycdw4jX8CSdWwlFQX1kc8DtfRgwaiTtiE7ROGEc'
      }
    }).as('loginRequest');

    // 2. Intercepter la requête GET utilisateur qui suit
    // L'ID 5 doit correspondre à celui encodé dans le JWT ci-dessus
    cy.intercept('GET', '**/users/5', {
      statusCode: 200,
      body: {
        id: 5,
        email: "ryan.dordain@supinfo.com",
        pseudo: "Ryan",
        role: "user"
      }
    }).as('userRequest');

    // Remplir et soumettre le formulaire
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Attendre que la requête de connexion soit terminée
    cy.wait('@loginRequest');

    // Vérifier que le token est stocké dans localStorage
    // Utiliser le même token que celui fourni dans la réponse mock
    cy.window().should((win) => {
      expect(win.localStorage.getItem('token')).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicHNldWRvIjoiUnlhbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQxNjg2MzgzLCJleHAiOjE3NDE3NzI3ODN9.n44Dycdw4jX8CSdWwlFQX1kc8DtfRgwaiTtiE7ROGEc');
    });

    // Attendre la requête utilisateur
    cy.wait('@userRequest');

    // Vérifier que les données utilisateur sont correctement stockées
    cy.window().should((win) => {
      const userJson = win.localStorage.getItem('user');
      expect(userJson).to.not.be.null;

      const user = JSON.parse(userJson || '{}');
      expect(user).to.have.property('pseudo', 'Ryan');
      expect(user).to.have.property('role', 'user');
      expect(user).to.have.property('id', 5);
    });

    // Vérifier la redirection
    cy.location('pathname', { timeout: 5000 }).should('eq', '/');
  });

  it('navigue vers la page d\'inscription en cliquant sur le lien correspondant', () => {
    cy.get('a[href="/register"]').click();
    cy.url().should('include', '/register');
  });

  it('reste sur la page de connexion en cas d\'échec de connexion', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('failedLoginRequest');

    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@failedLoginRequest');

    // Vérifier qu'un message d'erreur s'affiche
    cy.get('.text-danger').should('be.visible')
      .and('contain.text', 'Email ou mot de passe incorrect');

    cy.url().should('include', '/login');
  });

  it('affiche un message d\'erreur si les champs sont vides', () => {
    // Soumettre un formulaire vide
    cy.get('button[type="submit"]').click();

    // Vérifier le message d'erreur
    cy.get('.text-danger').should('be.visible')
      .and('contain.text', 'Veuillez remplir tous les champs');
  });

  it('maintient la connexion après rafraîchissement de page', () => {
    // Simuler une connexion déjà établie
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicHNldWRvIjoiUnlhbiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzQxNjg2MzgzLCJleHAiOjE3NDE3NzI3ODN9.n44Dycdw4jX8CSdWwlFQX1kc8DtfRgwaiTtiE7ROGEc');
      win.localStorage.setItem('user', JSON.stringify({
        id: 5,
        email: "ryan.dordain@supinfo.com",
        pseudo: "Ryan",
        role: "user"
      }));
    });

    // Rafraîchir la page
    cy.reload();

    // Vérifier qu'on reste connecté
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null;
      const user = JSON.parse(win.localStorage.getItem('user') || '{}');
      expect(user).to.have.property('pseudo', 'Ryan');
    });

    // Vérifier les éléments d'interface pour utilisateurs connectés
    cy.visit('/');

    // Adapter ces assertions en fonction de votre interface
    cy.get('nav').should('exist')
      .and('contain.text', 'Réservations');
    cy.get('nav').should('exist')
      .and('contain.text', 'Mon compte');
  });
});

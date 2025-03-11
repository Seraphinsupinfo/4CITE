// cypress/e2e/admin/createHotel.cy.ts

describe('Page de création d\'hôtel (Admin)', () => {
  const adminUser = {
    id: 1,
    email: 'admin@example.com',
    pseudo: 'admin',
    role: 'admin'
  };

  const mockToken = 'fake-jwt-token';

  beforeEach(() => {
    // Simuler un utilisateur admin connecté
    cy.window().then((win) => {
      win.localStorage.setItem('token', mockToken);
      win.localStorage.setItem('user', JSON.stringify(adminUser));
    });

    // Intercepter la vérification de l'utilisateur pour éviter les redirections
    cy.intercept('GET', '**/user', {
      statusCode: 200,
      body: adminUser
    }).as('getUserData');

    // Visiter la page de création d'hôtel
    cy.visit('/admin/hotel/create');
  });

  it('devrait afficher le formulaire de création d\'hôtel', () => {
    // Vérifier le titre de la page
    cy.contains('h2', 'Créer un nouvel hôtel').should('be.visible');

    // Vérifier les champs du formulaire
    cy.contains('label', 'Nom de l\'hôtel').should('be.visible');
    cy.contains('label', 'Emplacement').should('be.visible');
    cy.contains('label', 'Description').should('be.visible');
    cy.contains('label', 'Images').should('be.visible');

    // Vérifier les boutons
    cy.contains('button', '+ Ajouter une image').should('be.visible');
    cy.contains('button', 'Créer l\'hôtel').should('be.visible');
  });

  it('devrait rediriger les utilisateurs non-admin vers la page d\'accueil', () => {
    // D'abord se déconnecter
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
      win.localStorage.removeItem('user');
    });

    // Puis simuler un utilisateur régulier
    const regularUser = {
      id: 2,
      email: 'user@example.com',
      pseudo: 'user',
      role: 'user'
    };

    cy.window().then((win) => {
      win.localStorage.setItem('token', 'regular-token');
      win.localStorage.setItem('user', JSON.stringify(regularUser));
    });

    // Intercepter la demande de données utilisateur
    cy.intercept('GET', '**/user', {
      statusCode: 200,
      body: regularUser
    }).as('getNonAdminUser');

    // Visiter la page et vérifier la redirection
    cy.visit('/admin/hotel/create');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('devrait permettre d\'ajouter un champ d\'image supplémentaire', () => {
    // Vérifier qu'il n'y a pas de champ d'image au départ
    cy.get('input[placeholder="Coller une URL d\'image"]').should('have.length', 0);

    // Cliquer sur le bouton pour ajouter un champ d'image
    cy.contains('button', '+ Ajouter une image').click();

    // Vérifier qu'un champ d'image a été ajouté
    cy.get('input[placeholder="Coller une URL d\'image"]').should('have.length', 1);

    // Ajouter un autre champ d'image
    cy.contains('button', '+ Ajouter une image').click();

    // Vérifier qu'il y a maintenant deux champs d'image
    cy.get('input[placeholder="Coller une URL d\'image"]').should('have.length', 2);
  });

  it('devrait créer un hôtel avec succès', () => {
    // Intercepter la requête de création d'hôtel
    cy.intercept('POST', '**/hotels', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'Test Hotel',
        location: 'Test Location',
        description: 'Test Description',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        creationDate: new Date().toISOString().split('T')[0]
      }
    }).as('createHotelRequest');

    // Remplir le formulaire
    cy.get('input[type="text"]').first().type('Test Hotel');
    cy.get('input[type="text"]').eq(1).type('Test Location');
    cy.get('textarea').type('Test Description');

    // Ajouter des images
    cy.contains('button', '+ Ajouter une image').click();
    cy.get('input[placeholder="Coller une URL d\'image"]').type('https://example.com/image1.jpg');
    cy.contains('button', '+ Ajouter une image').click();
    cy.get('input[placeholder="Coller une URL d\'image"]').eq(1).type('https://example.com/image2.jpg');

    // Soumettre le formulaire
    cy.contains('button', 'Créer l\'hôtel').click();

    // Vérifier que la requête a été envoyée avec les bonnes données
    cy.wait('@createHotelRequest').its('request.body').should('deep.include', {
      name: 'Test Hotel',
      location: 'Test Location',
      description: 'Test Description',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
    });

    // Vérifier le message de succès
    cy.contains('Hôtel créé avec succès !').should('be.visible');

    // Vérifier la redirection après 2 secondes
    cy.wait(2000);
    cy.url().should('include', '/admin');
  });

  it('devrait gérer les erreurs lors de la création d\'hôtel', () => {
    // Intercepter la requête avec une erreur
    cy.intercept('POST', '**/hotels', {
      statusCode: 500,
      body: {
        message: 'Erreur serveur'
      }
    }).as('createHotelError');

    // Remplir le formulaire
    cy.get('input[type="text"]').first().type('Test Hotel');
    cy.get('input[type="text"]').eq(1).type('Test Location');
    cy.get('textarea').type('Test Description');
    cy.contains('button', '+ Ajouter une image').click();
    cy.get('input[placeholder="Coller une URL d\'image"]').type('https://example.com/image1.jpg');

    // Soumettre le formulaire
    cy.contains('button', 'Créer l\'hôtel').click();

    // Attendre la requête
    cy.wait('@createHotelError');

    // Vérifier le message d'erreur
    cy.contains('Erreur lors de la création de l\'hôtel.').should('be.visible');

    // Vérifier qu'on reste sur la même page
    cy.url().should('include', '/admin/hotel/create');
  });

  it('devrait vérifier la validation des champs obligatoires', () => {
    // Essayer de soumettre le formulaire sans remplir les champs
    cy.contains('button', 'Créer l\'hôtel').click();

    // Vérifier que le formulaire n'a pas été soumis (validation HTML5)
    cy.url().should('include', '/admin/hotel/create');

    // Vérifier les attributs required
    cy.get('input[required]').should('have.length', 2);
    cy.get('textarea[required]').should('have.length', 1);
  });

  it('devrait ignorer les champs d\'image vides', () => {
    // Intercepter la requête de création d'hôtel
    cy.intercept('POST', '**/hotels', {
      statusCode: 201,
      body: {
        id: 1,
        name: 'Test Hotel',
        location: 'Test Location',
        description: 'Test Description',
        images: ['https://example.com/image1.jpg'],
        creationDate: new Date().toISOString().split('T')[0]
      }
    }).as('createHotelRequest');

    // Remplir le formulaire
    cy.get('input[type="text"]').first().type('Test Hotel');
    cy.get('input[type="text"]').eq(1).type('Test Location');
    cy.get('textarea').type('Test Description');

    // Ajouter des images - une valide, une vide
    cy.contains('button', '+ Ajouter une image').click();
    cy.get('input[placeholder="Coller une URL d\'image"]').type('https://example.com/image1.jpg');
    cy.contains('button', '+ Ajouter une image').click();
    // Laisser le deuxième champ vide

    // Soumettre le formulaire
    cy.contains('button', 'Créer l\'hôtel').click();

    // Vérifier que la requête a été envoyée avec uniquement l'image non vide
    cy.wait('@createHotelRequest').its('request.body.images').should('deep.equal', [
      'https://example.com/image1.jpg'
    ]);

    // Vérifier le message de succès
    cy.contains('Hôtel créé avec succès !').should('be.visible');
  });
});

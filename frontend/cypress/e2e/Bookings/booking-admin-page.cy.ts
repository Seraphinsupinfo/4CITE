// cypress/e2e/bookings/bookings-admin.cy.ts

describe('Page de gestion des réservations - Admin', () => {
  beforeEach(() => {
    // Simuler un admin connecté
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-admin-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        pseudo: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      }));
    });

    // Intercepter la requête de réservations
    cy.intercept('GET', '**/users/1/bookings', {
      statusCode: 200,
      body: [
        {
          id: 1,
          startDate: '2024-11-20',
          endDate: '2024-11-25',
          userId: 123,
          hotelId: 456,
          hotel: {
            id: 456,
            name: 'Hôtel de Test',
            location: 'Paris, France',
            images: ['https://example.com/hotel1.jpg']
          }
        }
      ]
    }).as('getAdminBookings');

    cy.visit('/bookings');
    cy.wait('@getAdminBookings');
  });

  it('affiche l\'interface admin avec champs de recherche', () => {
    // Vérifier le titre admin
    cy.get('h2').should('contain.text', 'Gérer les réservations');

    // Vérifier les champs de recherche
    cy.get('input[placeholder="Rechercher par email"]').should('be.visible');
    cy.get('input[placeholder="Rechercher par numéro de réservation"]').should('be.visible');
    cy.contains('button', 'Rechercher').should('be.visible');
  });

  it('permet la recherche par email', () => {
    cy.intercept('GET', '**/bookings*', (req) => {
      if (req.query && req.query.user_email === 'client@example.com') {
        req.reply({
          statusCode: 200,
          body: [
            {
              id: 5,
              startDate: '2024-10-15',
              endDate: '2024-10-20',
              userId: 456,
              hotelId: 789,
              hotel: {
                id: 789,
                name: 'Hôtel Recherché',
                location: 'Nice, France',
                images: ['https://example.com/hotel5.jpg']
              }
            }
          ]
        });
      }
    }).as('searchBookingsByEmail');

    cy.get('input[placeholder="Rechercher par email"]').type('client@example.com');

    cy.get('button').contains('Rechercher').click();

    cy.wait('@searchBookingsByEmail', { timeout: 10000 });

    cy.contains('Hôtel Recherché');
    cy.contains('Nice, France');
  });


  it('permet la recherche par ID de réservation', () => {
    // Intercepter la requête de recherche par ID
    cy.intercept('GET', '**/bookings/7', {
      statusCode: 200,
      body: {
        id: 7,
        startDate: '2024-09-05',
        endDate: '2024-09-10',
        userId: 789,
        hotelId: 123,
        hotel: {
          id: 123,
          name: 'Hôtel Spécifique',
          location: 'Bordeaux, France',
          images: ['https://example.com/hotel7.jpg']
        }
      }
    }).as('searchBookingById');

    // Entrer un ID et rechercher
    cy.get('input[placeholder="Rechercher par numéro de réservation"]').type('7');
    cy.contains('button', 'Rechercher').click();

    // Attendre la requête
    cy.wait('@searchBookingById');

    // Vérifier les résultats
    cy.contains('Réservation #7');
    cy.contains('Hôtel Spécifique');
    cy.contains('Bordeaux, France');
  });

  it('désactive les champs de date pour les administrateurs', () => {
    // Vérifier que les inputs de dates sont désactivés
    cy.get('input[type="date"]').should('be.disabled');
  });

  it('n\'affiche pas de bouton d\'annulation pour les administrateurs', () => {
    // Vérifier l'absence du bouton d'annulation
    cy.contains('button', 'Annuler la réservation').should('not.exist');
  });

  it('affiche une alerte si recherche sans critères', () => {
    // Cliquer sur rechercher sans entrer de critères
    cy.contains('button', 'Rechercher').click();

    // Vérifier l'alerte
    cy.contains('Veuillez entrer un email ou un numéro de réservation');
  });
});

// cypress/e2e/bookings/bookings-page.cy.ts

describe('Page de gestion des réservations', () => {
  beforeEach(() => {
    // Simuler un utilisateur connecté
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 123,
        pseudo: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }));
    });

    cy.intercept('GET', '**/users/123/bookings', {
      statusCode: 200,
      body: [
        {
          id: 1,
          startDate: '2027-11-20',
          endDate: '2027-11-25',
          userId: 123,
          hotelId: 456,
          hotel: {
            id: 456,
            name: 'Hôtel de Test',
            location: 'Paris, France',
            images: ['https://example.com/hotel1.jpg']
          }
        },
        {
          id: 2,
          startDate: '2027-12-15',
          endDate: '2027-12-20',
          userId: 123,
          hotelId: 789,
          hotel: {
            id: 789,
            name: 'Hôtel Magnifique',
            location: 'Lyon, France',
            images: ['https://example.com/hotel2.jpg']
          }
        }
      ]
    }).as('getBookings');

    cy.visit('/bookings');
    cy.wait('@getBookings');
  });

  it('affiche correctement la liste des réservations', () => {
    cy.get('h2').should('contain.text', 'Mes réservations');

    // Vérifier que les réservations sont affichées
    cy.get('.row > div').should('have.length', 2);

    // Vérifier les détails de la première réservation
    cy.get('.row > div:first-child').within(() => {
      cy.contains('Réservation #1');
      cy.contains('Hôtel de Test');
      cy.contains('Paris, France');

      // Vérifier les dates (maintenant en 2027)
      cy.get('input[type="date"]').first().should('have.value', '2027-11-20');
      cy.get('input[type="date"]').last().should('have.value', '2027-11-25');

      // Vérifier les boutons
      cy.contains('button', 'Afficher l\'hôtel');
      cy.contains('button', 'Annuler la réservation');
    });
  });

  it('permet d\'annuler une réservation', () => {
    // D'abord, vérifier que nous avons bien deux réservations au départ
    cy.get('.row > div').should('have.length', 2);
    cy.contains('Réservation #1');
    cy.contains('Hôtel de Test');

    cy.intercept('DELETE', '**/bookings/1', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteBooking');

    cy.intercept('GET', '**/users/123/bookings', {
      statusCode: 200,
      body: [
        {
          id: 2,
          startDate: '2027-12-15',
          endDate: '2027-12-20',
          userId: 123,
          hotelId: 789,
          hotel: {
            id: 789,
            name: 'Hôtel Magnifique',
            location: 'Lyon, France',
            images: ['https://example.com/hotel2.jpg']
          }
        }
      ]
    }).as('getUpdatedBookings');

    cy.contains('button', 'Annuler la réservation').first().click();

    cy.wait('@deleteBooking');

    cy.wait('@getUpdatedBookings');

    cy.get('.row > div').should('have.length', 1);
    cy.contains('Hôtel de Test').should('not.exist');
    cy.contains('Paris, France').should('not.exist');

    cy.contains('Réservation #2');
    cy.contains('Hôtel Magnifique');
    cy.contains('Lyon, France');
  });


  it('permet de modifier les dates d\'une réservation', () => {

    cy.get('input[type="date"]').first().clear().type('2027-12-01');
    cy.get('input[type="date"]').eq(1).clear().type('2027-12-05');

    // Vérifier que le bouton "Sauvegarder les changements" apparaît
    cy.contains('button', 'Sauvegarder les changements').should('be.visible');

    // Intercepter la requête de mise à jour
    cy.intercept('PUT', '**/bookings/1', {
      statusCode: 200,
      body: { success: true }
    }).as('updateBooking');

    // Cliquer pour sauvegarder
    cy.contains('button', 'Sauvegarder les changements').click();

    // Attendre que la requête soit envoyée
    cy.wait('@updateBooking');

    // Vérifier qu'un toast de confirmation s'affiche
    cy.contains('Les changements ont été sauvegardés avec succès');
  });

  it('désactive le bouton d\'annulation pour les réservations passées', () => {
    // Intercepter avec une réservation passée
    cy.intercept('GET', '**/users/123/bookings', {
      statusCode: 200,
      body: [
        {
          id: 3,
          startDate: '2023-01-01',
          endDate: '2023-01-05', // Date passée (inchangée car ce test vérifie spécifiquement ce comportement)
          userId: 123,
          hotelId: 456,
          hotel: {
            id: 456,
            name: 'Hôtel Ancien',
            location: 'Marseille, France',
            images: ['https://example.com/hotel3.jpg']
          }
        }
      ]
    }).as('getPastBookings');

    // Recharger la page
    cy.visit('/bookings');
    cy.wait('@getPastBookings');

    // Vérifier que le bouton est désactivé
    cy.contains('button', 'Annuler la réservation').should('be.disabled');
  });
});

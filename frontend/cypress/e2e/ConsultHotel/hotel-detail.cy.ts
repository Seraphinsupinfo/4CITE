// cypress/e2e/hotel/hotel-details.cy.ts

describe('Page de détail d\'un hôtel', () => {
  const hotelId = 123;

  describe('Affichage pour un utilisateur connecté', () => {
    beforeEach(() => {
      // Simuler un utilisateur connecté (non admin)
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'fake-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: 456,
          pseudo: 'usertest',
          email: 'user@example.com',
          role: 'user'
        }));
      });

      // Mock pour les données de l'hôtel
      cy.intercept('GET', `**/hotels/${hotelId}`, {
        statusCode: 200,
        body: {
          id: hotelId,
          name: "Hôtel Royal",
          location: "Paris, France",
          description: "Un hôtel luxueux au cœur de Paris avec vue sur la Tour Eiffel.",
          images: [
            "https://example.com/hotel1.jpg",
            "https://example.com/hotel2.jpg",
            "https://example.com/hotel3.jpg"
          ],
          creationDate: "2023-01-01"
        }
      }).as('getHotel');

      // Visiter la page de l'hôtel
      cy.visit(`/hotel/${hotelId}`);
      cy.wait('@getHotel');
    });

    it('ne doit pas afficher les fonctionnalités d\'administration', () => {
      cy.get('textarea').should('not.exist');
      cy.contains('button', 'Enregistrer les modifications').should('not.exist');
      cy.contains('button', 'Supprimer l\'hôtel').should('not.exist');
      cy.contains('button', 'Ajouter une image').should('not.exist');
    });

    it('affiche le bouton de réservation pour les utilisateurs connectés', () => {
      // Vérifier le bloc de réservation
      cy.contains('Réserver maintenant').should('be.visible');
      cy.get('#startDate').should('exist');
      cy.get('#endDate').should('exist');

      // Pour un utilisateur connecté, vérifier le bouton de réservation
      cy.contains('button', 'Réserver').should('be.visible');
      cy.contains('Vous devez être connecté pour réserver').should('not.exist');
    });

    it('permet de faire une réservation', () => {
      // Intercepter la requête de réservation
      cy.intercept('POST', '**/bookings', {
        statusCode: 201,
        body: { id: 789, startDate: '2023-12-01', endDate: '2023-12-05' }
      }).as('createBooking');

      // Sélectionner des dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);

      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const dayAfterStr = dayAfter.toISOString().split('T')[0];

      cy.get('#startDate').clear().type(tomorrowStr);
      cy.get('#endDate').clear().type(dayAfterStr);

      // Cliquer sur le bouton de réservation
      cy.contains('button', 'Réserver').click();

      // Attendre la requête et vérifier le toast de succès
      cy.wait('@createBooking');
      cy.contains('Réservation effectuée avec succès!').should('be.visible');
    });

    it('gère les erreurs de réservation', () => {
      // Intercepter la requête de réservation avec une erreur
      cy.intercept('POST', '**/bookings', {
        statusCode: 400,
        body: { message: 'Dates de réservation invalides' }
      }).as('failedBooking');

      // Cliquer sur le bouton de réservation sans changer les dates
      cy.contains('button', 'Réserver').click();

      // Attendre la requête et vérifier le toast d'erreur
      cy.wait('@failedBooking');
      cy.contains('Erreur lors de la réservation').should('be.visible');
    });
  });
});

describe('Page de détail d\'un hôtel (fonctionnalités admin)', () => {
  const hotelId = 123;

    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'admin-jwt-token');
        win.localStorage.setItem('user', JSON.stringify({
          id: 789,
          pseudo: 'admintest',
          email: 'admin@example.com',
          role: 'admin'
        }));
      });

      cy.intercept('GET', `**/hotels/${hotelId}`, {
        statusCode: 200,
        body: {
          id: hotelId,
          name: "Hôtel Royal",
          location: "Paris, France",
          description: "Un hôtel luxueux au cœur de Paris avec vue sur la Tour Eiffel.",
          images: [
            "https://www.yonder.fr/sites/default/files/styles/lg-insert/public/contenu/destinations/jw%20marriott%20grand-guest-room-kin33335-02317-Classic-Hor.jpeg?itok=uspYnIKX",
            "https://www.yonder.fr/sites/default/files/styles/lg-insert/public/contenu/destinations/jw%20marriott%20grand-guest-room-kin33335-02317-Classic-Hor.jpeg?itok=uspYnIKX",
            "https://www.yonder.fr/sites/default/files/styles/lg-insert/public/contenu/destinations/jw%20marriott%20grand-guest-room-kin33335-02317-Classic-Hor.jpeg?itok=uspYnIKX"
          ],
          creationDate: "2023-01-01"
        }
      }).as('getHotel');

      // Visiter la page de l'hôtel
      cy.visit(`/hotel/${hotelId}`);
      cy.wait('@getHotel');
    });

    it('affiche les contrôles d\'administration pour les admins', () => {
      cy.get('input[class*="form-control"]').should('exist');
      cy.get('textarea').should('exist');
      cy.contains('button', 'Enregistrer les modifications').should('be.visible');
      cy.contains('button', 'Supprimer l\'hôtel').should('be.visible');
      cy.contains('button', 'Ajouter une image').should('be.visible');
    });

    it('permet de modifier les informations de l\'hôtel', () => {
      cy.intercept('PUT', `**/hotels/${hotelId}`, {
        statusCode: 200,
        body: { success: true }
      }).as('updateHotel');

      cy.get('input[class*="form-control"]').first().clear().type('Hôtel Royal Palace');
      cy.get('input[class*="form-control"]').eq(1).clear().type('https://example.com/new-image.jpg');
      cy.get('textarea').clear().type('Description mise à jour pour l\'hôtel de luxe.');

      cy.contains('button', 'Enregistrer les modifications').click();

      cy.wait('@updateHotel');
      cy.contains('Hôtel mis à jour avec succès!').should('be.visible');
    });

    it('permet d\'ajouter une nouvelle image', () => {
      cy.get('.gallery-item').then($items => {
        const initialCount = $items.length;

        cy.contains('button', 'Ajouter une image').click();

        cy.get('.gallery-item').should('have.length', initialCount + 1);

        cy.get('.gallery-item').eq(initialCount).find('input').should('exist');
      });
    });

    it('permet de supprimer l\'hôtel après confirmation', () => {
      cy.intercept('DELETE', `**/hotels/${hotelId}`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteHotel');

      cy.on('window:confirm', () => true);

      cy.contains('button', 'Supprimer l\'hôtel').click();

      cy.wait('@deleteHotel');
      cy.contains('Hôtel supprimé avec succès!').should('be.visible');

      cy.url().should('include', '/');
    });

    it('annule la suppression si confirmation refusée', () => {
      cy.on('window:confirm', () => false);

      cy.intercept('DELETE', `**/hotels/${hotelId}`, {
        statusCode: 200,
        body: { success: true }
      }).as('deleteHotel');

      cy.contains('button', 'Supprimer l\'hôtel').click();

      cy.get('@deleteHotel.all').should('have.length', 0);

      cy.url().should('include', `/hotel/${hotelId}`);
    });
});

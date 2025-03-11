// cypress/e2e/home-performance.cy.ts

describe('Performance de la page d\'accueil', () => {
  it('devrait charger la page en moins de 3 secondes', () => {
    // Mesurer le temps de chargement de la page
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-loading');
      },
      onLoad: (win) => {
        win.performance.mark('end-loading');
      }
    });

    cy.window().then((win) => {
      win.performance.measure('page-load', 'start-loading', 'end-loading');
      const measure = win.performance.getEntriesByName('page-load')[0];
      const duration = measure.duration;
      expect(duration).to.be.lessThan(3000); // 3000ms = 3s
    });
  });

  it('devrait charger les images avec une bonne résolution', () => {
    cy.visit('/');

    cy.get('img').each(($img) => {
      cy.wrap($img)
        .should('have.prop', 'naturalWidth')
        .and('be.gt', 100);

      cy.wrap($img)
        .should('have.prop', 'naturalHeight')
        .and('be.gt', 100);
    });
  });

});

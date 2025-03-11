// cypress/e2e/home-interaction.cy.ts

describe('Interactions sur la page d\'accueil', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('devrait mettre en évidence le champ de recherche lorsqu\'il est focus', () => {
    cy.get('input[name="searchbar"]')
      .focus()
      .should('have.focus');

    // Vérifiez si votre application ajoute une classe ou change le style lors du focus
    // Par exemple:
    // .should('have.class', 'focused')
    // ou
    // .should('have.css', 'box-shadow').and('not.equal', 'none');
  });

  it('devrait avoir un effet de survol sur le bouton de recherche', () => {
    cy.get('button[type="submit"]')
      .trigger('mouseover')
      .should('have.css', 'cursor', 'pointer');

    // Vérifiez si votre bouton change d'apparence au survol
    // Par exemple:
    // .should('have.css', 'background-color').and('not.equal', 'rgb(0, 123, 255)')
  });

  it('devrait charger les images correctement', () => {
    // Vérifier que toutes les images se chargent correctement
    cy.get('img').each(($img) => {
      cy.wrap($img)
        .should('be.visible')
        .and('have.prop', 'naturalWidth')
        .should('be.greaterThan', 0);
    });
  });
});

// cypress/e2e/home.cy.ts

describe('Page d\'accueil', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('En-tête', () => {
    it('devrait afficher le titre principal', () => {
      cy.get('h1')
        .should('be.visible')
        .and('contain', 'Trouvez l\'hotel qui vous convient pour des vacances à votre image');
    });

    it('devrait afficher le sous-titre', () => {
      cy.get('p.fw-bold.text-success')
        .should('be.visible')
        .and('contain', 'Plus de 20 000 Hotels partout dans le monde');
    });

    it('devrait afficher les trois images d\'hôtels', () => {
      cy.get('.position-relative > div > img')
        .should('have.length', 3)
        .each(($img) => {
          // Vérifier que chaque image est chargée
          cy.wrap($img)
            .should('be.visible')
            .and('have.prop', 'naturalWidth')
            .should('be.greaterThan', 0);
        });
    });
  });

  describe('Section de recherche', () => {
    it('devrait afficher le titre de la section de recherche', () => {
      cy.get('h2')
        .should('be.visible')
        .and('contain', 'Rechercher un Hotel');
    });

    it('devrait afficher le sous-titre de la section de recherche', () => {
      cy.get('.text-center.text-lg-start p')
        .should('be.visible')
        .and('contain', 'Ou allez vous ?');
    });

    it('devrait afficher le champ de recherche', () => {
      cy.get('input[name="searchbar"]')
        .should('be.visible')
        .and('have.attr', 'placeholder', 'Une ville, un hôtel, etc...');
    });

    it('devrait afficher le bouton de recherche avec l\'icône', () => {
      cy.get('button[type="submit"]')
        .should('be.visible')
        .find('.bi.bi-search')
        .should('exist');
    });

    it('devrait permettre de saisir du texte dans le champ de recherche', () => {
      const searchText = 'Paris';
      cy.get('input[name="searchbar"]')
        .type(searchText)
        .should('have.value', searchText);
    });
  });

  describe('Responsive design', () => {
    it('devrait s\'afficher correctement sur un écran mobile', () => {
      cy.viewport('iphone-x');

      cy.get('h1').should('be.visible');
      cy.get('h2').should('be.visible');
      cy.get('input[name="searchbar"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('devrait s\'afficher correctement sur une tablette', () => {
      cy.viewport('ipad-2');

      cy.get('h1').should('be.visible');
      cy.get('h2').should('be.visible');
      cy.get('input[name="searchbar"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('devrait s\'afficher correctement sur un grand écran', () => {
      cy.viewport(1920, 1080);

      cy.get('h1').should('be.visible');
      cy.get('h2').should('be.visible');
      cy.get('input[name="searchbar"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });
  });
})

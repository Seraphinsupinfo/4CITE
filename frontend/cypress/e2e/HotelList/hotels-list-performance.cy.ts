// cypress/e2e/hotels-list-performance.cy.ts

describe('Page de liste des hôtels - Performance', () => {
  const mockHotels = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Hôtel ${i + 1}`,
    location: `Ville ${i + 1}, Pays`,
    images: [`https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg`],
    description: `Description de l'hôtel ${i + 1}`,
    price: 100 + i * 5
  }));

  it('devrait charger la page en moins de 5 secondes', () => {
    cy.intercept('GET', '**/hotels?sortBy=creationDate&limit=100', {
      statusCode: 200,
      body: mockHotels,
      delay: 1000
    }).as('getSlowHotels');

    const start = Date.now();

    cy.visit('/hotels');
    cy.wait('@getSlowHotels');

    cy.get('.col.mb-4').should('have.length', 20).then(() => {
      const end = Date.now();
      const loadTime = end - start;
      expect(loadTime).to.be.lessThan(5000); // 5 secondes
    });
  });

  it('devrait gérer le chargement progressif des images', () => {
    cy.intercept('GET', '**/hotels?sortBy=creationDate&limit=100', {
      statusCode: 200,
      body: mockHotels,
    }).as('getHotels');

    cy.visit('/hotels');
    cy.wait('@getHotels');

    cy.get('.card img').each(($img) => {
      cy.wrap($img).should('have.attr', 'src');
    });
  });

  it('devrait réagir rapidement au défilement', () => {
    cy.intercept('GET', '**/hotels?sortBy=creationDate&limit=100', {
      statusCode: 200,
      body: mockHotels,
    }).as('getHotels');

    cy.visit('/hotels');
    cy.wait('@getHotels');

    cy.scrollTo('bottom', { duration: 1000 });

    cy.get('.col.mb-4').last().should('be.visible');

    cy.scrollTo('top', { duration: 1000 });

    cy.get('.col.mb-4').first().should('be.visible');
  });

  it('devrait gérer le chargement d\'un grand nombre d\'hôtels', () => {
    const manyHotels = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Hôtel ${i + 1}`,
      location: `Ville ${i + 1}, Pays`,
      images: [`https://example.com/hotel${i + 1}.jpg`],
      description: `Description de l'hôtel ${i + 1}`,
      price: 100 + i * 5
    }));

    cy.intercept('GET', '**/hotels?sortBy=creationDate&limit=100', {
      statusCode: 200,
      body: manyHotels
    }).as('getManyHotels');

    cy.visit('/hotels');
    cy.wait('@getManyHotels');

    cy.get('.col.mb-4').should('have.length', 50);

    cy.get('.col.mb-4').last().scrollIntoView();
    cy.get('.col.mb-4').last().should('be.visible');
  });
});

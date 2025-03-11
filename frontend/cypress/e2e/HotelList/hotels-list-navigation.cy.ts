// cypress/e2e/hotels-list-navigation.cy.ts

describe('Page de liste des hôtels - Navigation', () => {
  const mockHotels = [
    {
      id: 1,
      name: "Grand Hôtel Palace",
      location: "Paris, France",
      images: ["https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg"],
      description: "Un superbe hôtel au cœur de Paris",
      price: 150
    },
    {
      id: 2,
      name: "Seaside Resort",
      location: "Nice, France",
      images: ["https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg"],
      description: "Vue imprenable sur la mer",
      price: 200
    },
    {
      id: 3,
      name: "Mountain Lodge",
      location: "Chamonix, France",
      images: ["https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg"],
      description: "Parfait pour les amateurs de ski",
      price: 180
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '**/hotels?sortBy=creationDate&limit=100', {
      statusCode: 200,
      body: mockHotels
    }).as('getHotels');

    cy.visit('/hotels');
    cy.wait('@getHotels');
  });

  it('devrait rediriger vers la page détaillée de l\'hôtel au clic', () => {
    cy.intercept('GET', `**/hotel/${mockHotels[0].id}`, {
      statusCode: 200
    }).as('getHotelDetail');

    cy.get('.card a').first().click();

    cy.url().should('include', `/hotel/${mockHotels[0].id}`);
  });

  it('devrait permettre de revenir à la page d\'accueil', () => {
    cy.get('.navbar-brand').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('devrait conserver l\'URL correcte après un rechargement de page', () => {
    cy.reload();
    cy.url().should('include', '/hotels');
    cy.wait('@getHotels');
  });
});

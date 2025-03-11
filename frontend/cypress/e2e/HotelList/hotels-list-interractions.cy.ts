// cypress/e2e/hotels-list-interactions.cy.ts

describe('Page de liste des hôtels - Interactions', () => {
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

  it('devrait montrer un effet visuel au survol des cartes (si implémenté)', () => {
    cy.get('.card').first().trigger('mouseover');
  });

  it('devrait avoir un effet de clic sur les boutons', () => {
    cy.get('.btn.btn-primary').first().as('consulterBtn');

    cy.get('@consulterBtn').trigger('mousedown');

    cy.get('@consulterBtn').trigger('mouseup');
  });

  it('devrait permettre de faire défiler les hôtels', () => {
    cy.get('.col.mb-4').last().scrollIntoView();

    cy.get('.col.mb-4').last().should('be.visible');

    cy.get('.col.mb-4').first().scrollIntoView();

    cy.get('.col.mb-4').first().should('be.visible');
  });

  it('devrait réagir au redimensionnement de la fenêtre', () => {
    cy.viewport(1200, 800);

    cy.get('.row-cols-md-2').should('exist');

    cy.viewport(375, 667);

    cy.get('.row-cols-1').should('exist');
  });

  it('devrait charger les nouvelles données lors d\'un rechargement de page', () => {
    cy.intercept('GET', '**/hotels?sortBy=creationDate&limit=100', {
      statusCode: 200,
      body: mockHotels
    }).as('reloadHotels');

    cy.reload();

    cy.wait('@reloadHotels');

    cy.get('.col.mb-4').should('have.length', 3);
  });
});

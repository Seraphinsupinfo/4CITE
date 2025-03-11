// cypress/e2e/hotels-list.cy.ts

describe('Page de liste des hôtels - Tests de base', () => {
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

  it('devrait afficher le titre principal', () => {
    cy.get('h2.fw-bold').should('be.visible').and('contain', 'Hôtels');
  });

  it('devrait afficher le sous-titre', () => {
    cy.get('p.text-muted').should('be.visible').and('contain', 'Parcourez notre sélection');
  });

  it('devrait afficher trois cartes d\'hôtels', () => {
    cy.get('.col.mb-4').should('have.length', 3);
  });

  it('devrait afficher le nom de chaque hôtel', () => {
    mockHotels.forEach(hotel => {
      cy.get('.card h4.fw-bold').should('contain', hotel.name);
    });
  });

  it('devrait afficher l\'emplacement de chaque hôtel', () => {
    mockHotels.forEach(hotel => {
      cy.get('.card p.text-muted').should('contain', hotel.location);
    });
  });

  it('devrait afficher le badge "Disponible" pour chaque hôtel', () => {
    cy.get('.badge.bg-success').should('have.length', 3).and('contain', 'Disponible');
  });

  it('devrait afficher les images des hôtels', () => {
    cy.get('.card img').should('have.length', 3);

    cy.get('.card img').each(($img, index) => {
      expect($img.attr('src')).to.equal(mockHotels[index].images[0]);
    });
  });

  it('devrait s\'afficher correctement sur un écran mobile', () => {
    cy.viewport('iphone-x');

    cy.visit('/hotels');
    cy.wait('@getHotels');

    cy.get('h2.fw-bold').should('be.visible');
    cy.get('.col.mb-4').should('have.length', 3);

    cy.get('.row-cols-1').should('exist');
  });

  it('devrait s\'afficher correctement sur une tablette', () => {
    cy.viewport('ipad-2');

    cy.visit('/hotels');
    cy.wait('@getHotels');

    cy.get('h2.fw-bold').should('be.visible');
    cy.get('.col.mb-4').should('have.length', 3);
  });

  it('devrait s\'afficher correctement sur un grand écran', () => {
    cy.viewport(1920, 1080);

    cy.visit('/hotels');
    cy.wait('@getHotels');

    cy.get('h2.fw-bold').should('be.visible');
    cy.get('.col.mb-4').should('have.length', 3);

    cy.get('.row-cols-md-2').should('exist');
  });

  it('devrait adapter la taille des images au viewport', () => {
    cy.viewport('iphone-x');
    cy.visit('/hotels');
    cy.wait('@getHotels');

    cy.get('.card img').should('have.css', 'height', '250px');

    cy.viewport(1920, 1080);
    cy.reload();

    cy.get('.card img').should('have.css', 'height', '250px');
  });
});

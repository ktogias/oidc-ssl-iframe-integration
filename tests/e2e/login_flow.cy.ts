const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;

describe('Portal login flow', () => {
  it('completes the Keycloak login and surfaces partner claims', () => {
    cy.visit('/');

    cy.origin(
      'https://keycloak.localhost:8443',
      { args: { username, password } },
      ({ username, password }) => {
        cy.get('input#username').type(username);
        cy.get('input#password').type(password);
        cy.get('input#kc-login').click();
      }
    );

    cy.url({ timeout: 15000 }).should('include', 'https://portal.localhost');
    cy.contains('Portal Dashboard', { timeout: 15000 }).should('be.visible');
    cy.contains('Demo User').should('be.visible');

    cy.visit('/partner/?popup_handshake=true');

    cy.origin(
      'https://keycloak.localhost:8443',
      { args: { username, password } },
      ({ username, password }) => {
        cy.get('body').then(($body) => {
          if ($body.find('input#username').length) {
            cy.get('input#username').type(username);
            cy.get('input#password').type(password);
            cy.get('input#kc-login').click();
          }
        });
      }
    );

    cy.contains('Partner Application', { timeout: 15000 }).should('be.visible');
    cy.contains('"username": "demo.user"', { timeout: 15000 }).should('exist');
    cy.contains('"email": "demo.user@example.com"').should('exist');
    cy.contains('"partner-user"').should('exist');
    cy.contains('"portal-user"').should('exist');

    cy.visit('/');
    cy.contains('Partner connected', { timeout: 20000 }).should('be.visible');
    cy.contains('Iframe session established.', { timeout: 20000 }).should('be.visible');

    cy.get('iframe[title="Partner application"]', { timeout: 20000 })
      .should('be.visible')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .within(() => {
        cy.contains('"username": "demo.user"').should('exist');
        cy.contains('"email": "demo.user@example.com"').should('exist');
        cy.contains('"roles"').should('exist');
        cy.contains('"partner-user"').should('exist');
        cy.contains('"portal-user"').should('exist');
      });
  });
});

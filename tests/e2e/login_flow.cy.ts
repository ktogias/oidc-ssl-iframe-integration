const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;

const maybeLoginThroughKeycloak = () => {
  cy.url({ timeout: 20000 }).then((currentUrl) => {
    if (!currentUrl.includes('keycloak.localhost:8443')) {
      return;
    }

    cy.origin(
      'https://keycloak.localhost:8443',
      { args: { username, password } },
      ({ username, password }) => {
        cy.get('input#username').clear().type(username);
        cy.get('input#password').clear().type(password);
        cy.get('input#kc-login').click();
      }
    );
  });
};

describe('Portal login flow', () => {
  it('completes the Keycloak login and surfaces partner claims', () => {
    cy.visit('/');
    maybeLoginThroughKeycloak();

    cy.contains('Portal Dashboard', { timeout: 20000 }).should('be.visible');
    cy.contains('Demo User').should('exist');

    cy.visit('/partner/?popup_handshake=true');
    maybeLoginThroughKeycloak();

    cy.contains('Partner Application', { timeout: 20000 }).should('exist');
    cy.contains('"username": "demo.user"', { timeout: 20000 }).should('exist');
    cy.contains('"email": "demo.user@example.com"').should('exist');

    cy.visit('/');
    cy.get('iframe[title="Partner application"]', { timeout: 20000 })
      .should('be.visible')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .within(() => {
        cy.contains('"username": "demo.user"').should('exist');
        cy.contains('"email": "demo.user@example.com"').should('exist');
      });
  });
});

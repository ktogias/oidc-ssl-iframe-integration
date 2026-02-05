const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;

const loginThroughKeycloak = () => {
  cy.url({ timeout: 20000 }).should('include', 'keycloak.localhost:8443');
  cy.origin(
    'https://keycloak.localhost:8443',
    { args: { username, password } },
    ({ username, password }) => {
      cy.get('input#username').clear().type(username);
      cy.get('input#password').clear().type(password);
      cy.get('input#kc-login').click();
    }
  );
  cy.url({ timeout: 20000 }).should('include', 'https://portal.localhost');
};

describe('Portal login flow', () => {
  it('completes the Keycloak login and surfaces partner claims', () => {
    // Initial portal login
    cy.visit('/');
    loginThroughKeycloak();
    cy.contains('Portal Dashboard', { timeout: 20000 }).should('be.visible');

    // Drive the partner handshake by visiting the popup URL directly
    cy.visit('/partner/?popup_handshake=true');
    loginThroughKeycloak();
    cy.contains('Partner Application', { timeout: 20000 }).should('exist');
    cy.contains('"username": "demo.user"', { timeout: 20000 }).should('exist');
    cy.contains('"email": "demo.user@example.com"').should('exist');

    // Return to the portal shell and assert iframe session
    cy.visit('/');
    cy.contains('Iframe session established.', { timeout: 20000 }).should('be.visible');
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

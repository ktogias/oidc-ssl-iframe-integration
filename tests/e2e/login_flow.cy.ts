const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;

const completePortalLogin = () => {
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
    cy.visit('/');
    completePortalLogin();

    cy.contains('Portal Dashboard', { timeout: 20000 }).should('be.visible');
    cy.contains('Demo User').should('exist');

    cy.visit('/partner/?popup_handshake=true');
    completePortalLogin();

    cy.url({ timeout: 20000 }).should('include', '/partner');
    cy.contains('Partner Application', { timeout: 20000 }).should('be.visible');
    cy.contains('"username": "demo.user"', { timeout: 20000 }).should('exist');
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

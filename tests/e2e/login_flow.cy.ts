const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;

describe('Portal login flow', () => {
  it('completes Keycloak login and returns to the portal shell', () => {
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

    cy.contains('Portal Dashboard', { timeout: 10000 }).should('be.visible');
    cy.contains('Launch the partner session using the button above to display the iframe.')
      .should('be.visible');
  });
});

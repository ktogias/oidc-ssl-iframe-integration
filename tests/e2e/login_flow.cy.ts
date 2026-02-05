const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;

describe('Portal login flow', () => {
  it('completes the Keycloak login and surfaces partner claims', () => {
    let handshakeDone = false;

    cy.visit('/');

    cy.window().then((win) => {
      cy.stub(win, 'open')
        .callsFake((url: string) => {
          cy.request({ url, followRedirect: true }).then(() => {
            handshakeDone = true;
            win.postMessage({ type: 'partner-handshake-complete' }, win.location.origin);
          });
          return { closed: false, close() {}, focus() {} } as Window;
        })
        .as('handshakePopup');
    });

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
    cy.contains('Portal Dashboard', { timeout: 20000 }).should('be.visible');

    cy.contains('Connect partner session').click();
    cy.get('@handshakePopup').should('have.been.called');
    cy.wrap(null, { timeout: 20000 }).should(() => expect(handshakeDone).to.be.true);

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
      });
  });
});

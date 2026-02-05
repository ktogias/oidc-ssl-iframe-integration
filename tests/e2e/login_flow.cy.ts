const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;
const email = Cypress.env('PORTAL_EMAIL') as string;

const PORTAL_ORIGIN = 'https://portal.localhost';
const KEYCLOAK_ORIGIN = 'https://keycloak.localhost:8443';

const completeKeycloakLogin = () =>
  cy
    .origin(
      KEYCLOAK_ORIGIN,
      { args: { username, password } },
      ({ username, password }) => {
        cy.get('input#username', { timeout: 20000 })
          .should('be.visible')
          .clear()
          .type(username);
        cy.get('input#password').clear().type(password, { log: false });
        cy.get('input#kc-login').click();
      }
    )
    .then(() => cy.location('origin', { timeout: 20000 }).should('eq', PORTAL_ORIGIN));

const ensurePortalOrigin = (): Cypress.Chainable =>
  cy.location('origin', { timeout: 20000 }).then((origin) => {
    if (origin === KEYCLOAK_ORIGIN) {
      return completeKeycloakLogin().then(() => ensurePortalOrigin());
    }

    return cy.wrap(origin).should('eq', PORTAL_ORIGIN);
  });

const startFreshPortalSession = () => {
  cy.visit('/');
  cy.location('origin', { timeout: 20000 }).should('eq', KEYCLOAK_ORIGIN);
  completeKeycloakLogin();
};

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.origin(KEYCLOAK_ORIGIN, () => {
    cy.visit('/');
    cy.clearCookies();
    cy.clearLocalStorage();
  });
});

describe('Portal login flow', () => {
  it('completes the Keycloak login and surfaces partner claims', () => {
    startFreshPortalSession();
    cy.contains('Portal Dashboard', { timeout: 20000 }).should('be.visible');

    cy.visit('/partner/?popup_handshake=true');
    ensurePortalOrigin();
    cy.url({ timeout: 20000 }).should('include', '/partner');
    cy.contains('Partner Application', { timeout: 20000 }).should('exist');
    cy.contains(`"username": "${username}"`, { timeout: 20000 }).should('exist');
    if (email) {
      cy.contains(`"email": "${email}"`, { timeout: 20000 }).should('exist');
    }

    cy.visit('/');
    ensurePortalOrigin();
    cy.contains('Iframe session established.', { timeout: 20000 }).should('be.visible');

    cy.get('iframe[title="Partner application"]', { timeout: 20000 })
      .should('be.visible')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(cy.wrap)
      .within(() => {
        cy.contains(`"username": "${username}"`).should('exist');
        if (email) {
          cy.contains(`"email": "${email}"`).should('exist');
        }
      });
  });
});

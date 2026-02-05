const username = Cypress.env('PORTAL_USERNAME') as string;
const password = Cypress.env('PORTAL_PASSWORD') as string;
const email = Cypress.env('PORTAL_EMAIL') as string;
const rawRoles = Cypress.env('PORTAL_ROLES') as string | string[] | undefined;
const portalRoles = Array.isArray(rawRoles)
  ? rawRoles
  : (rawRoles ?? '')
      .split(',')
      .map((role) => role.trim())
      .filter((role) => role.length > 0);

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
  ensurePortalOrigin();
};

const waitForIframeClaims = () => {
  ensurePortalOrigin();
  cy.contains('Iframe session established.', { timeout: 20000 }).should('be.visible');

  cy.get('iframe[title="Partner application"]', { timeout: 20000 })
    .should('be.visible')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then((body) => {
      cy.wrap(body)
        .find('#claims', { timeout: 20000 })
        .invoke('text')
        .should((raw) => {
          expect(raw.trim(), 'partner claims payload').to.match(/^\{/);
        })
        .then((raw) => {
          const parsed = JSON.parse(raw.trim()) as {
            claims: { username?: string; email?: string; roles?: string[] };
            headers: Record<string, unknown>;
          };

          const expectedClaims: Record<string, unknown> = { username };
          if (email) {
            expectedClaims.email = email;
          }

          expect(parsed.claims).to.deep.include(expectedClaims);
          if (portalRoles.length > 0) {
            expect(parsed.claims.roles, 'partner roles claim').to.be.an('array');
            expect(parsed.claims.roles).to.include.members(portalRoles);
          }
          expect(parsed.headers['X-User-Name']).to.equal(username);
          if (email) {
            expect(parsed.headers['X-User-Email']).to.equal(email);
          }
          if (portalRoles.length > 0) {
            expect(parsed.headers['X-User-Roles']).to.be.a('string');
          }
        });
    });
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

    waitForIframeClaims();
  });
});

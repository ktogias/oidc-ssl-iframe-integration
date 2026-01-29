import { KeycloakService } from 'keycloak-angular';

type KeycloakJsonConfig = {
  url: string;
  realm: string;
  clientId: string;
};

export function initializeKeycloak(keycloak: KeycloakService) {
  return async () => {
    const response = await fetch('/assets/keycloak.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Unable to load Keycloak configuration');
    }
    const config = (await response.json()) as KeycloakJsonConfig;

    await keycloak.init({
      config,
      initOptions: {
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: true,
        silentCheckSsoRedirectUri: `${window.location.origin}/assets/oidc-silent-check.html`,
      },
      enableBearerInterceptor: false,
      bearerPrefix: 'Bearer',
    });
  };
}

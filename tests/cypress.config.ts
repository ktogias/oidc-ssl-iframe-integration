import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'https://portal.localhost',
    specPattern: 'e2e/**/*.cy.ts',
    supportFile: 'support/e2e.ts',
    downloadsFolder: 'artifacts/downloads',
    screenshotsFolder: 'artifacts/screenshots',
    videosFolder: 'artifacts/videos',
    chromeWebSecurity: false,
    env: {
      PORTAL_USERNAME: process.env.CYPRESS_PORTAL_USERNAME ?? 'demo.user',
      PORTAL_PASSWORD: process.env.CYPRESS_PORTAL_PASSWORD ?? 'changeMe123'
    }
  }
});

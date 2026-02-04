import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'https://portal.localhost',
    specPattern: 'tests/e2e/**/*.cy.ts',
    supportFile: 'tests/support/e2e.ts',
    downloadsFolder: 'tests/artifacts/downloads',
    screenshotsFolder: 'tests/artifacts/screenshots',
    videosFolder: 'tests/artifacts/videos'
  }
});

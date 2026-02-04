import { defineConfig } from 'cypress';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const baseUrl = process.env.CYPRESS_BASE_URL ?? 'https://portal.localhost';
const portalUsername =
  process.env.CYPRESS_PORTAL_USERNAME ?? process.env.DEMO_USER_USERNAME ?? 'demo.user';
const portalPassword =
  process.env.CYPRESS_PORTAL_PASSWORD ?? process.env.DEMO_USER_PASSWORD ?? 'changeMe123';

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: 'e2e/**/*.cy.ts',
    supportFile: 'support/e2e.ts',
    downloadsFolder: 'artifacts/downloads',
    screenshotsFolder: 'artifacts/screenshots',
    videosFolder: 'artifacts/videos',
    chromeWebSecurity: false,
    env: {
      PORTAL_USERNAME: portalUsername,
      PORTAL_PASSWORD: portalPassword
    }
  }
});

import { defineConfig } from 'cypress';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const baseUrl = process.env.CYPRESS_BASE_URL ?? 'https://portal.localhost';
const portalUsername =
  process.env.CYPRESS_PORTAL_USERNAME ?? process.env.DEMO_USER_USERNAME ?? 'demo.user';
const portalPassword =
  process.env.CYPRESS_PORTAL_PASSWORD ?? process.env.DEMO_USER_PASSWORD ?? 'changeMe123';
const portalEmail =
  process.env.CYPRESS_PORTAL_EMAIL ?? process.env.DEMO_USER_EMAIL ?? 'demo.user@example.com';

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: 'e2e/**/*.cy.ts',
    supportFile: 'support/e2e.ts',
    downloadsFolder: 'artifacts/downloads',
    screenshotsFolder: 'artifacts/screenshots',
    videosFolder: 'artifacts/videos',
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          launchOptions.args.push('--disable-popup-blocking');
        }

        return launchOptions;
      });

      return config;
    },
    env: {
      PORTAL_USERNAME: portalUsername,
      PORTAL_PASSWORD: portalPassword,
      PORTAL_EMAIL: portalEmail
    }
  }
});

import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the built app on a throwaway database, so a test run
 * never touches the demo data in ./data.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined } }
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined }
      }
    }
  ],
  webServer: {
    command: 'npm run build && DB_PATH=./data/e2e.db RESET=1 npx tsx scripts/seed.ts && DB_PATH=./data/e2e.db PORT=4100 JWT_SECRET=e2e-secret-key npx tsx src/server/index.ts',
    url: 'http://127.0.0.1:4100/api/health',
    reuseExistingServer: false,
    timeout: 120_000
  }
});

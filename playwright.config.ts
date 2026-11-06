import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './config/environments';
import type { EnvironmentOptions } from './fixtures';

const environment = getEnvironment();
const isCI = !!process.env.CI;
const dependsOnEnvironment = { dependencies: ['environment'] };

export default defineConfig<EnvironmentOptions>({
  testDir: './tests',
  metadata: { environment: environment.name, baseURL: environment.baseURL },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // The target is a shared public server that answers "heavy load (queue full)" beyond ~2 workers.
  workers: isCI ? 1 : 2,
  maxFailures: isCI ? 10 : undefined,
  globalTimeout: isCI ? 50 * 60 * 1000 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  expect: { timeout: 10_000 },
  use: {
    baseURL: environment.baseURL,
    environment,
    testIdAttribute: 'data-qa',
    locale: 'en-US',
    timezoneId: 'UTC',
    serviceWorkers: 'block',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'environment', testDir: './tests/setup', testMatch: /.*\.setup\.ts/ },
    { name: 'api', testDir: './tests/api', ...dependsOnEnvironment },
    { name: 'chromium', testDir: './tests/ui', use: { ...devices['Desktop Chrome'] }, ...dependsOnEnvironment },
    // Run with --project=firefox / --project=webkit (or npm run test:all-browsers).
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'] },
      default: false,
      ...dependsOnEnvironment,
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'] },
      default: false,
      ...dependsOnEnvironment,
    },
  ],
});

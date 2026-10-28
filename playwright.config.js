const { defineConfig } = require('@playwright/test');

const cloud = process.env.HYPEREXECUTE === 'true';
if (cloud) {
  for (const variable of ['LT_USERNAME', 'LT_ACCESS_KEY', 'FORM_PASSWORD']) {
    if (!process.env[variable]) throw new Error(`Missing required environment variable: ${variable}`);
  }
}
const capabilities = {
  browserName: 'Chrome',
  browserVersion: 'latest',
  'LT:Options': {
    platform: process.env.HYPEREXECUTE_PLATFORM || (process.env.TARGET_OS === 'win' ? 'Windows 10' : 'Linux'),
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    build: 'Playwright 102',
    project: 'playwright 102',
    name: `Playwright 102 - ${process.env.TARGET_OS || process.platform}`,
    playwrightClientVersion: require('@playwright/test/package.json').version,
    geoLocation: 'IN',
    timezone: 'Kolkata',
    video: true,
    network: true,
    console: true,
    tunnel: false,
  },
};

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://www.testmuai.com/selenium-playground/',
    browserName: 'chromium',
    locale: 'en-GB',
    headless: true,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    ...(cloud ? {
      connectOptions: {
        wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`,
      },
    } : {}),
  },
});
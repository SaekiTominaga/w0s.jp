import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	reporter: 'list', // https://playwright.dev/docs/test-reporters
	use: {
		baseURL: 'http://localhost:3000',
	},
	projects: [
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		command: 'pnpm -F astro dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
	},
	outputDir: '.playwright/test-results',
	maxFailures: process.env.CI ? 1 : 0,
});

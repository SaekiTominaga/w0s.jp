import { expect, test } from '@playwright/test';

test.afterEach(async ({ page }) => {
	await page.close();
});

test.describe('referrer', () => {
	test('no param', async ({ page }) => {
		await page.goto('/contact_completed');

		await expect(page.getByRole('link', { name: 'トップページへ戻る' })).toHaveAttribute('href', '/');
	});

	test('empty', async ({ page }) => {
		await page.goto('/contact_completed?referrer=');

		await expect(page.getByRole('link', { name: 'トップページへ戻る' })).toHaveAttribute('href', '/');
	});

	test('relative path', async ({ page }) => {
		await page.goto('/contact_completed?referrer=path/to');

		await expect(page.getByRole('link', { name: 'トップページへ戻る' })).toHaveAttribute('href', '/');
	});

	test('start with /', async ({ page }) => {
		await page.goto('/contact_completed?referrer=/path/to');

		await expect(page.getByRole('link', { name: '元のページへ戻る' })).toHaveAttribute('href', '/path/to');
	});
});

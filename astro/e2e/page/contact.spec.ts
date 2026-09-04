import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context, page }) => {
	await context.setExtraHTTPHeaders({
		'X-Requested-With': '@playwright/test',
	});

	await page.goto('/contact');
});

test.afterEach(async ({ page }) => {
	await page.close();
});

test('page pattern', async ({ page }) => {
	const stepItem = page.getByRole('list').filter({ hasText: '入力 入力 確認 確認 完了' }).getByRole('listitem');
	const stepItemInput = stepItem.filter({ hasNot: page.getByRole('emphasis'), hasText: '入力' });
	const stepItemInputSelf = stepItem.filter({ has: page.getByRole('emphasis'), hasText: '入力' });
	const stepItemConfirm = stepItem.filter({ hasNot: page.getByRole('emphasis'), hasText: '確認' });
	const stepItemConfirmSelf = stepItem.filter({ has: page.getByRole('emphasis'), hasText: '確認' });
	const stepItemComplete = stepItem.filter({ hasText: '完了' });

	const userInput = page.locator('.js-screen-input').filter({ hasText: '名前 任意 Eメールアドレス 必須 返信の有無 必須 必要 不要' });
	const userConfirm = page.locator('.js-screen-confirm').filter({ hasText: '入力内容確認' });

	const confirmButton = page.getByRole('button', { name: '入力内容を確認' });
	const correctButton = page.getByRole('button', { name: '修正' });
	const submitButton = page.getByRole('button', { name: '送信' });

	/* input (init) */
	await Promise.all([
		expect(stepItemInput).toBeHidden(),
		expect(stepItemInputSelf).toBeVisible(),
		expect(stepItemConfirm).toBeVisible(),
		expect(stepItemConfirmSelf).toBeHidden(),
		expect(stepItemComplete).toBeVisible(),

		expect(userInput).toBeVisible(),
		expect(userConfirm).toBeHidden(),

		expect(confirmButton).toBeVisible(),
		expect(correctButton).toBeHidden(),
		expect(submitButton).toBeHidden(),
	]);

	await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
	await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
	await page.getByRole('textbox', { name: '内容 必須' }).fill('Hello');
	await confirmButton.click();

	/* confirm */
	await Promise.all([
		expect(stepItemInput).toBeVisible(),
		expect(stepItemInputSelf).toBeHidden(),
		expect(stepItemConfirm).toBeHidden(),
		expect(stepItemConfirmSelf).toBeVisible(),
		expect(stepItemComplete).toBeVisible(),

		expect(userInput).toBeHidden(),
		expect(userConfirm).toBeVisible(),

		expect(confirmButton).toBeHidden(),
		expect(correctButton).toBeVisible(),
		expect(submitButton).toBeVisible(),
	]);

	await correctButton.click();

	/* input */
	await Promise.all([
		expect(stepItemInput).toBeHidden(),
		expect(stepItemInputSelf).toBeVisible(),
		expect(stepItemConfirm).toBeVisible(),
		expect(stepItemConfirmSelf).toBeHidden(),
		expect(stepItemComplete).toBeVisible(),

		expect(userInput).toBeVisible(),
		expect(userConfirm).toBeHidden(),

		expect(confirmButton).toBeVisible(),
		expect(correctButton).toBeHidden(),
		expect(submitButton).toBeHidden(),
	]);
});

test.describe('validator', () => {
	test('Eメールアドレス', async ({ page }) => {
		const input = page.getByRole('textbox', { name: 'Eメールアドレス 必須' });
		const validate = page.locator(`#${(await input.getAttribute('aria-errormessage')) ?? ''}`);

		const confirmButton = page.getByRole('button', { name: '入力内容を確認' });

		await confirmButton.click();

		await Promise.all([expect(input).toHaveAttribute('aria-invalid', 'true'), expect(validate).toBeVisible()]);

		await input.fill('mail');
		await confirmButton.click();

		await Promise.all([expect(input).toHaveAttribute('aria-invalid', 'true'), expect(validate).toBeVisible()]);

		await input.fill('mail@example.com');
		await confirmButton.click();

		await Promise.all([expect(input).toHaveAttribute('aria-invalid', 'false'), expect(validate).toBeHidden()]);
	});

	test('返信の有無', async ({ page }) => {
		const radiogroup = page.getByRole('radiogroup', { name: '返信の有無 必須' });
		const validate = page.locator(`#${(await radiogroup.getAttribute('aria-errormessage')) ?? ''}`);

		const confirmButton = page.getByRole('button', { name: '入力内容を確認' });

		await confirmButton.click();

		await Promise.all([expect(radiogroup).toHaveAttribute('aria-invalid', 'true'), expect(validate).toBeVisible()]);

		await radiogroup.getByRole('radio', { name: '必要' }).check();
		await confirmButton.click();

		await Promise.all([expect(radiogroup).toHaveAttribute('aria-invalid', 'false'), expect(validate).toBeHidden()]);
	});

	test('内容', async ({ page }) => {
		const textarea = page.getByRole('textbox', { name: '内容 必須' });
		const validate = page.locator(`#${(await textarea.getAttribute('aria-errormessage')) ?? ''}`);

		const confirmButton = page.getByRole('button', { name: '入力内容を確認' });

		await confirmButton.click();

		await Promise.all([expect(textarea).toHaveAttribute('aria-invalid', 'true'), expect(validate).toBeVisible()]);

		await textarea.fill('Hello');
		await confirmButton.click();

		await Promise.all([expect(textarea).toHaveAttribute('aria-invalid', 'false'), expect(validate).toBeHidden()]);
	});
});

test('confirm', async ({ page }) => {
	await page.getByRole('textbox', { name: '名前 任意' }).fill('name');
	await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
	await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
	await page.getByRole('textbox', { name: '内容 必須' }).fill('Hello');
	await page.getByRole('button', { name: '入力内容を確認' }).click();

	const confirm = page.locator('.js-screen-confirm').filter({ hasText: '入力内容確認' });

	await Promise.all([
		expect(confirm.locator('.js-confirm-output[for="input-name"]')).toHaveText('name'),
		expect(confirm.locator('.js-confirm-output[for="input-email"]')).toHaveText('mail@example.com'),
		expect(confirm.locator('.js-confirm-output[for="input-reply-group"]')).toHaveText('必要'),
		expect(confirm.locator('.js-confirm-output[for="input-body"]')).toHaveText('Hello'),
	]);
});

test.describe('Astro Actions', () => {
	test('Basic NG word', async ({ page }) => {
		await page.getByRole('textbox', { name: '名前 任意' }).fill('name');
		await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
		await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
		await page.getByRole('textbox', { name: '内容 必須' }).fill('もしお返事いただける際は当社管理番号を削除せずご返信願います。');
		await page.getByRole('button', { name: '入力内容を確認' }).click();

		const [response] = await Promise.all([
			page.waitForResponse((res) => res.request().method() === 'POST'),
			page.getByRole('button', { name: '送信' }).click(),
		]);

		expect(response.status()).toBe(400);
		expect(response.url()).toBe('http://localhost:3000/contact?_action=contact.post');
	});

	test('Additional NG word', async ({ page }) => {
		await page.getByRole('textbox', { name: '名前 任意' }).fill('name');
		await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
		await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
		await page.getByRole('textbox', { name: '内容 必須' }).fill('Hello https://cutt.ly/XXX');
		await page.getByRole('button', { name: '入力内容を確認' }).click();

		const [response] = await Promise.all([
			page.waitForResponse((res) => res.request().method() === 'POST'),
			page.getByRole('button', { name: '送信' }).click(),
		]);

		expect(response.status()).toBe(400);
		expect(response.url()).toBe('http://localhost:3000/contact?_action=contact.post');
	});

	test.describe('not contain Japanese', () => {
		test('less than the required time', async ({ page }) => {
			await page.getByRole('textbox', { name: '名前 任意' }).fill('name');
			await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
			await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
			await page.getByRole('textbox', { name: '内容 必須' }).fill('Hello');
			await page.getByRole('button', { name: '入力内容を確認' }).click();

			/* ここで規定時間以上の待機がない場合はエラーになる */

			const [response] = await Promise.all([
				page.waitForResponse((res) => res.request().method() === 'POST'),
				page.getByRole('button', { name: '送信' }).click(),
			]);

			expect(response.status()).toBe(400);
			expect(response.url()).toBe('http://localhost:3000/contact?_action=contact.post');
		});

		test('success', async ({ page }) => {
			await page.getByRole('textbox', { name: '名前 任意' }).fill('name');
			await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
			await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
			await page.getByRole('textbox', { name: '内容 必須' }).fill('Hello');
			await page.getByRole('button', { name: '入力内容を確認' }).click();

			const [response] = await Promise.all([
				page.waitForResponse((res) => res.request().method() === 'POST'),
				page.getByRole('button', { name: '送信' }).click({ delay: 10_000 }),
			]);

			expect(response.status()).toBe(303);
			expect(await response.headerValue('Location')).toBe('/contact_completed?referrer=/contact');
		});
	});
});

test('referrer', async ({ context, page }) => {
	await context.setExtraHTTPHeaders({
		Referer: 'http://localhost:3000/path/to',
		'X-Requested-With': '@playwright/test',
	});

	await page.getByRole('textbox', { name: '名前 任意' }).fill('name');
	await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
	await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
	await page.getByRole('textbox', { name: '内容 必須' }).fill('こんにちは');
	await page.getByRole('button', { name: '入力内容を確認' }).click();

	const [response] = await Promise.all([page.waitForResponse((res) => res.request().method() === 'POST'), page.getByRole('button', { name: '送信' }).click()]);

	expect(response.status()).toBe(303);
	expect(await response.headerValue('Location')).toBe('/contact_completed?referrer=/path/to');
});

test.describe('JavaScript disabled', () => {
	test.use({ javaScriptEnabled: false });

	test('page pattern', async ({ page }) => {
		const stepItem = page.getByRole('list').filter({ hasText: '入力 入力 確認 確認 完了' }).getByRole('listitem');
		const stepItemInput = stepItem.filter({ hasNot: page.getByRole('emphasis'), hasText: '入力' });
		const stepItemInputSelf = stepItem.filter({ has: page.getByRole('emphasis'), hasText: '入力' });
		const stepItemConfirm = stepItem.filter({ hasNot: page.getByRole('emphasis'), hasText: '確認' });
		const stepItemConfirmSelf = stepItem.filter({ has: page.getByRole('emphasis'), hasText: '確認' });
		const stepItemComplete = stepItem.filter({ hasText: '完了' });

		const userInput = page.locator('.js-screen-input').filter({ hasText: '名前 任意 Eメールアドレス 必須 返信の有無 必須 必要 不要' });
		const userConfirm = page.locator('.js-screen-confirm').filter({ hasText: '入力内容確認' });

		const confirmButton = page.getByRole('button', { name: '入力内容を確認' });
		const correctButton = page.getByRole('button', { name: '修正' });
		const submitButton = page.getByRole('button', { name: '送信' });

		await Promise.all([
			expect(stepItemInput).toBeHidden(),
			expect(stepItemInputSelf).toBeVisible(),
			expect(stepItemConfirm).toBeHidden(),
			expect(stepItemConfirmSelf).toBeHidden(),
			expect(stepItemComplete).toBeVisible(),

			expect(userInput).toBeVisible(),
			expect(userConfirm).toBeHidden(),

			expect(confirmButton).toBeHidden(),
			expect(correctButton).toBeHidden(),
			expect(submitButton).toBeVisible(),
		]);
	});

	test.describe('validator', () => {
		test('required', async ({ page }) => {
			const validate = page.locator('.validate').filter({ hasText: '3個のエラーがあります。' });
			const validateListItem = validate.getByRole('listitem');

			const submitButton = page.getByRole('button', { name: '送信' });

			await submitButton.click();

			await Promise.all([
				expect(validate).toBeVisible(),
				expect(validateListItem).toHaveCount(3),
				expect(validateListItem.nth(0)).toHaveText('「Eメールアドレス」が入力されていないか、書式が正しくありません。'),
				expect(validateListItem.nth(1)).toHaveText('「返信の有無」が選択されていません。'),
				expect(validateListItem.nth(2)).toHaveText('「内容」が入力されていません。'),
			]);
		});

		test('format', async ({ page }) => {
			const validate = page.locator('.validate').filter({ hasText: '1個のエラーがあります。' });
			const validateListItem = validate.getByRole('listitem');

			const submitButton = page.getByRole('button', { name: '送信' });

			await Promise.all([
				page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail'),
				page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check(),
				page.getByRole('textbox', { name: '内容 必須' }).fill('Hello'),
			]);
			await submitButton.click();

			await Promise.all([
				expect(validate).toBeVisible(),
				expect(validateListItem).toHaveCount(1),
				expect(validateListItem.nth(0)).toHaveText('「Eメールアドレス」が入力されていないか、書式が正しくありません。'),
			]);
		});

		test('no error', async ({ page }) => {
			const submitButton = page.getByRole('button', { name: '送信' });

			await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com');
			await page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check();
			await page.getByRole('textbox', { name: '内容 必須' }).fill('こんにちは');

			const [response] = await Promise.all([page.waitForResponse((res) => res.request().method() === 'POST'), submitButton.click()]);

			expect(response.status()).toBe(303);
			expect(await response.headerValue('Location')).toBe('/contact_completed?referrer=/contact');
		});
	});
});

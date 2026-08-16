import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
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
		expect(page.locator('.js-screen-confirm').filter({ hasText: '名前 Eメールアドレス 返信の有無 内容' })).toBeHidden(),

		expect(confirmButton).toBeVisible(),
		expect(correctButton).toBeHidden(),
		expect(submitButton).toBeHidden(),
	]);

	await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com'); // TODO: Promise.all の中だとなぜか失敗する
	await Promise.all([
		page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check(),
		page.getByRole('textbox', { name: '内容 必須' }).fill('message'),
	]);
	await confirmButton.click();

	/* confirm */
	await Promise.all([
		expect(stepItemInput).toBeVisible(),
		expect(stepItemInputSelf).toBeHidden(),
		expect(stepItemConfirm).toBeHidden(),
		expect(stepItemConfirmSelf).toBeVisible(),
		expect(stepItemComplete).toBeVisible(),

		expect(userInput).toBeHidden(),
		expect(page.locator('.js-screen-confirm').filter({ hasText: '名前 Eメールアドレス mail@example.com 返信の有無 必要 内容 message' })).toBeVisible(),

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
		expect(page.locator('.js-screen-confirm').filter({ hasText: '名前 Eメールアドレス 返信の有無 内容' })).toBeHidden(),

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

		await textarea.fill('message');
		await confirmButton.click();

		await Promise.all([expect(textarea).toHaveAttribute('aria-invalid', 'false'), expect(validate).toBeHidden()]);
	});
});

test('confirm', async ({ page }) => {
	await page.getByRole('textbox', { name: '名前 任意' }).fill('name'); // TODO: Promise.all の中だとなぜか失敗する
	await page.getByRole('textbox', { name: 'Eメールアドレス 必須' }).fill('mail@example.com'); // TODO: Promise.all の中だとなぜか失敗する
	await Promise.all([
		page.getByRole('radiogroup', { name: '返信の有無 必須' }).getByRole('radio', { name: '必要' }).check(),
		page.getByRole('textbox', { name: '内容 必須' }).fill('message'),
	]);
	await page.getByRole('button', { name: '入力内容を確認' }).click();

	const confirm = page.locator('.js-screen-confirm').filter({ hasText: '名前 name Eメールアドレス mail@example.com 返信の有無 必要 内容 message' });

	await Promise.all([
		expect(confirm.locator('.js-confirm-output[data-ctrl-name="yourname"]')).toHaveText('name'),
		expect(confirm.locator('.js-confirm-output[data-ctrl-name="email"]')).toHaveText('mail@example.com'),
		expect(confirm.locator('.js-confirm-output[data-ctrl-name="reply"]')).toHaveText('必要'),
		expect(confirm.locator('.js-confirm-output[data-ctrl-name="body"]')).toHaveText('message'),
	]);
});

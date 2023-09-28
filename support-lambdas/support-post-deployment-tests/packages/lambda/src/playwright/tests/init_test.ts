import { expect, test } from '@playwright/test';

const userName = 'asdfasdfdsaf';
const userLastName = 'dfgslksdfgkjbsdf';
const userEmail = 'asdfa@example.com';

test.beforeEach(async ({ page, context, baseURL }) => {
	// const dobedo = 'http://support.theguardian.com';
	const pageUrl = `${
		baseURL ?? 'http://support.theguardian.com'
	}/uk/contribute`;
	await context.addCookies([
		{ name: 'pre-signin-test-user', value: userName, url: pageUrl },
		{ name: '_test_username', value: userName, url: pageUrl },
		{ name: '_post_deploy_user', value: 'true', url: pageUrl },
		{ name: 'GU_TK', value: '1.1', url: pageUrl },
	]);
	await page.goto(pageUrl);
});

test.describe('Sign up for a Recurring Contribution (New Contributions Flow)', () => {
	test('Monthly contribution sign-up with Stripe - GBP - step 1', async ({
		page,
	}) => {
		const contributeButton =
			'#qa-contributions-landing-submit-contribution-button';

		expect(page.url()).toContain('/contribute');

		await expect(page.locator(contributeButton)).toBeVisible();
	});

	test('Monthly contribution sign-up with Stripe - GBP - step 2', async ({
		page,
	}) => {
		const monthlyTab = '#MONTHLY';
		await page.locator(monthlyTab).click();

		await page.locator('#email').type(userEmail);
		await page.locator('#firstName').type(userName);
		await page.locator('#lastName').type(userLastName);

		await page.locator('#qa-credit-card').click();

		const cardnumber = page
			.frameLocator('#cardNumber iframe')
			.locator('input[name="cardnumber"]');
		await cardnumber.fill('4242424242424242');
	});
});

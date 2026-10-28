const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('Scenario 1: Simple Form Demo displays the entered message', async ({ page }) => {
  const message = process.env.TEST_MESSAGE || 'Welcome to TestMu AI';

  await page.getByRole('link', { name: 'Simple Form Demo', exact: true }).click();
  await expect(page).toHaveURL(/simple-form-demo/);
  await expect(async () => {
    await page.getByPlaceholder('Please enter your Message', { exact: true }).fill(message);
    await page.getByRole('button', { name: 'Get Checked Value', exact: true }).click();
    await expect(page.locator('#message')).toHaveText(message, { timeout: 1000 });
  }).toPass({ timeout: 15000 });
});

test('Scenario 2: Drag the default 15 slider to 95', async ({ page }) => {
  await page.getByRole('link', { name: 'Drag & Drop Sliders', exact: true }).click();
  const slider = page.locator('input[type="range"][value="15"]');
  const output = page.locator('#rangeSuccess');
  await expect(output).toHaveText('15');
  await slider.scrollIntoViewIfNeeded();
  const bounds = await slider.boundingBox();
  expect(bounds).not.toBeNull();
  const thumbRadius = 8;
  const trackWidth = bounds.width - thumbRadius * 2;
  const position = value => bounds.x + thumbRadius + ((value - 1) / 99) * trackWidth;
  const centerY = bounds.y + bounds.height / 2;

  await expect(async () => {
    await page.mouse.move(position(Number(await slider.inputValue())), centerY);
    await page.mouse.down();
    try {
      await page.mouse.move(position(90), centerY, { steps: 10 });
      await page.mouse.move(position(95), centerY, { steps: 10 });
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const current = Number(await slider.inputValue());
        if (current === 95) break;
        await page.mouse.move(position(95) + ((95 - current) / 99) * trackWidth, centerY);
      }
    } finally {
      await page.mouse.up();
    }
    await expect(slider).toHaveValue('95', { timeout: 1000 });
    await expect(output).toHaveText('95', { timeout: 1000 });
  }).toPass({ timeout: 15000 });
});

test('Scenario 3: Validate and submit the complete input form', async ({ page }) => {
  await page.getByRole('link', { name: 'Input Form Submit', exact: true }).click();
  const form = page.locator('#seleniumform');
  const name = form.getByPlaceholder('Name', { exact: true });
  await form.getByRole('button', { name: 'Submit', exact: true }).click();
  expect(await name.evaluate(element => element.validity.valueMissing)).toBe(true);
  expect(await name.evaluate(element => element.validationMessage)).toMatch(
    /^Please fill (?:in|out) this field\.$/,
  );

  const fields = {
    Name: 'Kakumaran',
    Email: 'kakumaran@example.com',
    Password: process.env.FORM_PASSWORD || randomUUID(),
    Company: 'Playwright 102',
    Website: 'https://example.com',
    City: 'New York',
    'Address 1': '123 Test Street',
    'Address 2': 'Suite 102',
    State: 'New York',
    'Zip code': '10001',
  };
  await expect(async () => {
    if (await page.locator('.success-msg').isVisible()) return;
    for (const [placeholder, value] of Object.entries(fields)) {
      await form.getByPlaceholder(placeholder, { exact: true }).fill(value);
    }
    await form.locator('select[name="country"]').selectOption({ label: 'United States' });
    await form.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.locator('.success-msg')).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15000 });
  await expect(page.locator('.success-msg')).toHaveText(
    'Thanks for contacting us, we will get back to you shortly.',
  );
});
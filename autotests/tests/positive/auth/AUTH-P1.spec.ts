import { test, expect } from '../../../fixtures/test.fixture';
import { RegisterPage } from '../../../pages/RegisterPage';
import { HomePage } from '../../../pages/HomePage';

// Registers a new user via UI form and verifies redirect to home page
test('AUTH-P1: Register new user via UI [Use Case]', async ({ page }) => {
  const id = Date.now();

  await test.step('PRECONDITIONS', async () => {
    await new RegisterPage(page).open();
  });

  await test.step('TEST', async () => {
    await new RegisterPage(page).register(`user${id}`, `user-${id}@test.com`, 'Password123!');
    await page.waitForURL('/', { timeout: 10000 });
    await expect(new HomePage(page).heroTitle).toBeVisible();
  });
});

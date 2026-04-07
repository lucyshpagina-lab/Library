import { test, expect } from '../../../fixtures/test.fixture';
import { LoginPage } from '../../../pages/LoginPage';

// Injects SQL payload in login email field, verifies login fails safely without crash
test('AUTH-S1: SQL injection in login email [SQL Injection]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new LoginPage(page).open();
  });

  await test.step('TEST', async () => {
    await new LoginPage(page).login("' OR 1=1 --", 'password');
    await expect(new LoginPage(page).tryAgainButton.or(page.locator('form'))).toBeVisible({ timeout: 10000 });
  });
});

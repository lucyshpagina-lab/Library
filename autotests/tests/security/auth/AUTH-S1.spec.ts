import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { LoginPage } from '../../../pages/LoginPage';

// Injects SQL payload in login email, verifies login fails safely
class AuthS1 extends BaseTest {
  async preconditions() { await new LoginPage(this.page).open(); }
  async test() {
    await new LoginPage(this.page).login("' OR 1=1 --", 'password');
    await expect(new LoginPage(this.page).tryAgainButton.or(this.page.locator('form'))).toBeVisible({ timeout: 10000 });
  }
  async postconditions() {}
}

test('AUTH-S1: SQL injection in login email [SQL Injection]', async ({ page }) => {
  const t = new AuthS1(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { LoginPage } from '../../../pages/LoginPage';

// Submits wrong credentials on login, verifies oops screen stays visible
class AuthN7 extends BaseTest {
  async preconditions() { await new LoginPage(this.page).open(); }
  async execute() {
    await new LoginPage(this.page).login('nonexistent@test.com', 'wrongpassword');
    await expect(new LoginPage(this.page).tryAgainButton).toBeVisible({ timeout: 10000 });
  }
  async postconditions() {}
}

test('AUTH-N7: Login with wrong creds shows oops screen [State Transition]', async ({ page }) => {
  const t = new AuthN7(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

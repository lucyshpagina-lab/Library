import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits register form with 7-char password (below min 8), verifies rejection
class AuthN2 extends BaseTest {
  async preconditions() { await new RegisterPage(this.page).open(); }
  async test() {
    const reg = new RegisterPage(this.page);
    await reg.usernameInput.fill('shortpw');
    await reg.emailInput.fill('short@test.com');
    await reg.passwordInput.fill('1234567');
    await reg.confirmPasswordInput.fill('1234567');
    await reg.submitButton.click();
    await expect(this.page).toHaveURL(/register/);
  }
  async postconditions() {}
}

test('AUTH-N2: Short password rejected 7 chars [EP]', async ({ page }) => {
  const t = new AuthN2(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

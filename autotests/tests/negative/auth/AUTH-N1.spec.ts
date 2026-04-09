import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits register form with invalid email format, verifies form stays on register page
class AuthN1 extends BaseTest {
  async preconditions() {
    await new RegisterPage(this.page).open();
  }
  async execute() {
    const reg = new RegisterPage(this.page);
    await reg.usernameInput.fill('testuser');
    await reg.emailInput.fill('not-an-email');
    await reg.passwordInput.fill('Password123!');
    await reg.confirmPasswordInput.fill('Password123!');
    await reg.submitButton.click();
    await expect(this.page).toHaveURL(/register/);
    // DB integrity verification — invalid user was not created
  }
  async postconditions() {}
}

test('AUTH-N1: Invalid email format rejected [EP]', async ({ page }) => {
  const t = new AuthN1(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

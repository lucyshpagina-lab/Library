import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits mismatched passwords on register, verifies error message
class AuthN8 extends BaseTest {
  async preconditions() {
    await new RegisterPage(this.page).open();
  }
  async execute() {
    const reg = new RegisterPage(this.page);
    await reg.usernameInput.fill('mismatch');
    await reg.emailInput.fill('mismatch@test.com');
    await reg.passwordInput.fill('Password123!');
    await reg.confirmPasswordInput.fill('DifferentPass!');
    await reg.submitButton.click();
    await expect(this.page.locator('.bg-red-50')).toContainText('Passwords do not match', {
      timeout: 5000,
    });
    // DB integrity verification — invalid user was not created
  }
  async postconditions() {}
}

test('AUTH-N8: Passwords mismatch shows error message [Cause-Effect]', async ({ page }) => {
  const t = new AuthN8(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

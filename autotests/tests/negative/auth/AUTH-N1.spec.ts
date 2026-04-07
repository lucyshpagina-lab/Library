import { test, expect } from '../../../fixtures/test.fixture';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits register form with invalid email format, verifies form stays on register page
test('AUTH-N1: Invalid email format rejected [EP]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new RegisterPage(page).open();
  });

  await test.step('TEST', async () => {
    const reg = new RegisterPage(page);
    await reg.usernameInput.fill('testuser');
    await reg.emailInput.fill('not-an-email');
    await reg.passwordInput.fill('Password123!');
    await reg.confirmPasswordInput.fill('Password123!');
    await reg.submitButton.click();
    await expect(page).toHaveURL(/register/);
  });
});

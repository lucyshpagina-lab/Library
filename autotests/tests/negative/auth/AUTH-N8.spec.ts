import { test, expect } from '../../../fixtures/test.fixture';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits mismatched passwords on register, verifies error message appears
test('AUTH-N8: Passwords mismatch shows error message [Cause-Effect]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new RegisterPage(page).open();
  });

  await test.step('TEST', async () => {
    const reg = new RegisterPage(page);
    await reg.usernameInput.fill('mismatch');
    await reg.emailInput.fill('mismatch@test.com');
    await reg.passwordInput.fill('Password123!');
    await reg.confirmPasswordInput.fill('DifferentPass!');
    await reg.submitButton.click();
    await expect(page.locator('.bg-red-50')).toContainText('Passwords do not match', { timeout: 5000 });
  });
});

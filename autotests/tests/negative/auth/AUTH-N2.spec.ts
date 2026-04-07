import { test, expect } from '../../../fixtures/test.fixture';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits register form with 7-char password (below min 8), verifies rejection
test('AUTH-N2: Short password rejected 7 chars [EP]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new RegisterPage(page).open();
  });

  await test.step('TEST', async () => {
    const reg = new RegisterPage(page);
    await reg.usernameInput.fill('shortpw');
    await reg.emailInput.fill('short@test.com');
    await reg.passwordInput.fill('1234567');
    await reg.confirmPasswordInput.fill('1234567');
    await reg.submitButton.click();
    await expect(page).toHaveURL(/register/);
  });
});

import { test, expect } from '../../../fixtures/test.fixture';
import { LoginPage } from '../../../pages/LoginPage';

// Submits wrong credentials on login, verifies oops screen stays visible
test('AUTH-N7: Login with wrong creds shows oops screen [State Transition]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new LoginPage(page).open();
  });

  await test.step('TEST', async () => {
    await new LoginPage(page).login('nonexistent@test.com', 'wrongpassword');
    await expect(new LoginPage(page).tryAgainButton).toBeVisible({ timeout: 10000 });
  });
});

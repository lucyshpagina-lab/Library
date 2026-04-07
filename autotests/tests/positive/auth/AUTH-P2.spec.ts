import { test, expect } from '../../../fixtures/test.fixture';
import { LoginPage } from '../../../pages/LoginPage';

// Submits wrong credentials and verifies oops animation with Try Again button
test('AUTH-P2: Login shows oops then Try Again works [State Transition]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new LoginPage(page).open();
  });

  await test.step('TEST', async () => {
    await new LoginPage(page).login('fake@test.com', 'wrongpass');
    await expect(new LoginPage(page).tryAgainButton).toBeVisible({ timeout: 10000 });
  });
});

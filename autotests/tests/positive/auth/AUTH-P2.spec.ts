import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { LoginPage } from '../../../pages/LoginPage';

// Submits wrong credentials and verifies oops animation with Try Again button
class AuthP2 extends BaseTest {
  async preconditions() {
    await new LoginPage(this.page).open();
  }

  async execute() {
    await new LoginPage(this.page).login('fake@test.com', 'wrongpass');
    await expect(new LoginPage(this.page).tryAgainButton).toBeVisible({ timeout: 10000 });
  }

  async postconditions() {}
}

test('AUTH-P2: Login shows oops then Try Again works [State Transition]', async ({ page }) => {
  const t = new AuthP2(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

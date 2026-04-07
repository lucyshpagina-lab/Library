import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';
import { HomePage } from '../../../pages/HomePage';

// Registers a new user via UI form and verifies redirect to home page
class AuthP1 extends BaseTest {
  private id = Date.now();

  async preconditions() {
    await new RegisterPage(this.page).open();
  }

  async test() {
    await new RegisterPage(this.page).register(`user${this.id}`, `user-${this.id}@test.com`, 'Password123!');
    await this.page.waitForURL('/', { timeout: 10000 });
    await expect(new HomePage(this.page).heroTitle).toBeVisible();
  }

  async postconditions() {}
}

test('AUTH-P1: Register new user via UI [Use Case]', async ({ page }) => {
  const t = new AuthP1(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

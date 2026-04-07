import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Registers with 3-char username (exact minimum boundary) and verifies success
class AuthP3 extends BaseTest {
  private id = Date.now();
  async preconditions() { await new RegisterPage(this.page).open(); }
  async test() {
    await new RegisterPage(this.page).register(`a${String(this.id).slice(-2)}`, `bva-${this.id}@test.com`, 'Password123!');
    await this.page.waitForURL('/', { timeout: 10000 });
  }
  async postconditions() {}
}

test('AUTH-P3: Register with exact boundary username 3 chars [BVA]', async ({ page }) => {
  const t = new AuthP3(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

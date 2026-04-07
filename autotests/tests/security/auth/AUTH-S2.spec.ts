import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Registers with XSS script tag as username, verifies safe handling
class AuthS2 extends BaseTest {
  async preconditions() {}
  async test() {
    const api = new ApiHelper();
    const res = await api.register(`xss-${Date.now()}@test.com`, '<script>alert("xss")</script>', 'Password123!');
    if (res.status === 201) expect(res.extract('user.username')).not.toContain('<script>');
  }
  async postconditions() {}
}

test('AUTH-S2: XSS in username during registration [XSS]', async ({ page }) => {
  const t = new AuthS2(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

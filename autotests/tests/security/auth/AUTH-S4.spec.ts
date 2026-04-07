import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Compares login response times for existing vs non-existing email
class AuthS4 extends BaseTest {
  async preconditions() {}
  async test() {
    const api = new ApiHelper();
    const email = `timing-${Date.now()}@test.com`;
    await api.register(email, `timing${Date.now()}`, 'Password123!');
    const t1 = Date.now(); await api.login(email, 'wrong'); const d1 = Date.now() - t1;
    const t2 = Date.now(); await api.login('fake@none.com', 'wrong'); const d2 = Date.now() - t2;
    expect(Math.abs(d1 - d2)).toBeLessThan(500);
  }
  async postconditions() {}
}

test('AUTH-S4: Login timing attack check [Security]', async ({ page }) => {
  const t = new AuthS4(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Registers with 2-char username (min-1 boundary), verifies API rejects
class AuthN4 extends BaseTest {
  async preconditions() {}
  async test() {
    const api = new ApiHelper();
    const res = await api.register(`bva-${Date.now()}@test.com`, 'xy', 'Password123!');
    expect(res.status).not.toBe(201);
  }
  async postconditions() {}
}

test('AUTH-N4: Username at min-1 boundary 2 chars fails [BVA]', async ({ page }) => {
  const t = new AuthN4(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

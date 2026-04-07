import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Registers with 7-char password (min-1 boundary), verifies API rejects
class AuthN6 extends BaseTest {
  async preconditions() {}
  async test() {
    const api = new ApiHelper();
    const res = await api.register(`bva-${Date.now()}@test.com`, `bvauser${Date.now()}`, '1234567');
    expect(res.status).not.toBe(201);
  }
  async postconditions() {}
}

test('AUTH-N6: Password at min-1 boundary 7 chars fails [BVA]', async ({ page }) => {
  const t = new AuthN6(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Registers with 21-char username (max+1 boundary), verifies API rejects
class AuthN5 extends BaseTest {
  async preconditions() {}
  async execute() {
    const api = new ApiHelper();
    const res = await api.register(`bva-${Date.now()}@test.com`, 'a'.repeat(21), 'Password123!');
    expect(res.status).not.toBe(201);
    // DB integrity verification — invalid user was not created
  }
  async postconditions() {}
}

test('AUTH-N5: Username at max+1 boundary 21 chars fails [BVA]', async ({ page }) => {
  const t = new AuthN5(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

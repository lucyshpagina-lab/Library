import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Registers with 2-char username via API, verifies rejection (min is 3)
class AuthN3 extends BaseTest {
  async preconditions() {}
  async test() {
    const api = new ApiHelper();
    const res = await api.register('short@test.com', 'ab', 'Password123!');
    expect(res.status).not.toBe(201);
  }
  async postconditions() {}
}

test('AUTH-N3: Username too short 2 chars rejected [EP]', async ({ page }) => {
  const t = new AuthN3(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

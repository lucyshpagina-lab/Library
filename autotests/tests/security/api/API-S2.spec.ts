import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Sends random string as JWT token, verifies 401
class ApiS2 extends BaseTest {
  async preconditions() {}
  async execute() {
    const res = await fetch('http://localhost:4000/api/auth/me', { headers: { Cookie: 'token=not-a-jwt' } });
    expect(res.status).toBe(401);
  }
  async postconditions() {}
}

test('API-S2: Random string as JWT token rejected [Token Security]', async ({ page }) => {
  const t = new ApiS2(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

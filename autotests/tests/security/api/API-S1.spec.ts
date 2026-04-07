import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Sends request with tampered JWT signature, verifies 401
class ApiS1 extends BaseTest {
  async preconditions() {}
  async test() {
    const res = await fetch('http://localhost:4000/api/auth/me', { headers: { Cookie: 'token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.TAMPERED' } });
    expect(res.status).toBe(401);
    expect((await res.json()).error).toContain('Invalid');
  }
  async postconditions() {}
}

test('API-S1: Tampered JWT token rejected [Token Security]', async ({ page }) => {
  const t = new ApiS1(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

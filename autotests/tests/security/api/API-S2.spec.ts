import { test, expect } from '../../../fixtures/test.fixture';

const API_URL = 'http://localhost:4000/api';

// Sends request with random string as JWT token, verifies 401 rejection
test('API-S2: Random string as JWT token rejected [Token Security]', async () => {
  await test.step('TEST', async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: 'token=this-is-not-a-jwt-token-at-all' },
    });
    expect(res.status).toBe(401);
  });
});

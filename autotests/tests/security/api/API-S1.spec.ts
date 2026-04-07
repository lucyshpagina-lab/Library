import { test, expect } from '../../../fixtures/test.fixture';

const API_URL = 'http://localhost:4000/api';

// Sends request with tampered JWT signature, verifies 401 rejection
test('API-S1: Tampered JWT token rejected [Token Security]', async () => {
  await test.step('TEST', async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: 'token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.TAMPERED' },
    });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Invalid');
  });
});

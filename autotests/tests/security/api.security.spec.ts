import { test, expect } from '../../fixtures/test.fixture';
import { log } from '../../helpers/api';

const API_URL = 'http://localhost:4000/api';

test.describe('🛡️ API [Security]', () => {

  test('API-S1: Tampered JWT token rejected [Token Security]', async () => {
    await test.step('🧪 TEST: Send request with tampered token', async () => {
      const tamperedToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.TAMPERED_SIGNATURE';
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Cookie: `token=${tamperedToken}` },
      });
      log.test('Sent request with tampered JWT signature');
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toContain('Invalid');
      log.success('Tampered token rejected with 401');
    });
  });

  test('API-S2: Random string as JWT token rejected [Token Security]', async () => {
    await test.step('🧪 TEST: Send request with random string token', async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Cookie: 'token=this-is-not-a-jwt-token-at-all' },
      });
      log.test('Sent request with random string as token');
      expect(res.status).toBe(401);
      log.success('Random string token rejected with 401');
    });
  });

  test('API-S3: Missing auth cookie → 401 [Authorization]', async () => {
    await test.step('🧪 TEST: Access protected endpoint without cookie', async () => {
      const endpoints = [
        { method: 'GET', path: '/auth/me' },
        { method: 'POST', path: '/books' },
        { method: 'GET', path: '/favorites' },
        { method: 'POST', path: '/favorites' },
        { method: 'GET', path: '/progress' },
      ];

      for (const ep of endpoints) {
        const res = await fetch(`${API_URL}${ep.path}`, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: ep.method === 'POST' ? '{}' : undefined,
        });
        log.test(`${ep.method} ${ep.path} → ${res.status}`);
        expect(res.status).toBe(401);
      }
      log.success('All protected endpoints return 401 without auth');
    });
  });

  test('API-S4: Oversized payload handled gracefully [DoS Protection]', async ({ api }) => {
    await test.step('🧪 TEST: Send extremely large book content', async () => {
      const hugeContent = 'x'.repeat(100000); // 100KB
      const res = await api.createBook({
        title: 'Huge Book',
        author: 'Big Author',
        genre: 'Science Fiction',
        content: hugeContent,
      });
      log.test(`Sent book with ${hugeContent.length} char content`);
      // Should either accept (if no limit) or reject gracefully — NOT crash
      expect([201, 400, 413, 422]).toContain(res.status);
      log.success(`Server handled gracefully (status: ${res.status})`);
    });

    await test.step('🧹 POSTCONDITION: Cleanup', async () => {
      await api.cleanupAll();
      log.postcondition('Large book cleaned up');
    });
  });
});

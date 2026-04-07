import { test, expect } from '../../../fixtures/test.fixture';

const API_URL = 'http://localhost:4000/api';

// Accesses all protected endpoints without auth cookie, verifies all return 401
test('API-S3: Missing auth cookie returns 401 [Authorization]', async () => {
  await test.step('TEST', async () => {
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
      expect(res.status).toBe(401);
    }
  });
});

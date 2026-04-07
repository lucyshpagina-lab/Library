import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Accesses all protected endpoints without auth cookie, verifies all return 401
class ApiS3 extends BaseTest {
  async preconditions() {}
  async execute() {
    for (const [m, p] of [['GET','/auth/me'],['POST','/books'],['GET','/favorites'],['POST','/favorites'],['GET','/progress']]) {
      const res = await fetch(`http://localhost:4000/api${p}`, { method: m, headers: { 'Content-Type': 'application/json' }, body: m === 'POST' ? '{}' : undefined });
      expect(res.status).toBe(401);
    }
  }
  async postconditions() {}
}

test('API-S3: Missing auth cookie returns 401 [Authorization]', async ({ page }) => {
  const t = new ApiS3(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

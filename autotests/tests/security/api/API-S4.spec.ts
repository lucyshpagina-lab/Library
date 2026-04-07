import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Sends 100KB payload, verifies server handles gracefully
class ApiS4 extends BaseTest {
  async preconditions() {}
  async execute() {
    const res = await this.api.createBook({ title: 'Huge', author: 'Big', genre: 'Sci-Fi', content: 'x'.repeat(100000) });
    expect([201, 400, 413, 422]).toContain(res.status);
  }
  async postconditions() { await this.api.cleanupAll(); }
}

test('API-S4: Oversized payload handled gracefully [DoS Protection]', async ({ authenticatedPage, api }) => {
  const t = new ApiS4(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

import { test, expect } from '../../fixtures/test.fixture';
import { BaseTest } from '../../helpers/BaseTest';

const API_URL = 'http://localhost:4000/api';

// Measures average response time for GET /books endpoint
class Load1 extends BaseTest {
  async preconditions() {}

  async execute() {
    const iterations = 50;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const res = await fetch(`${API_URL}/books?page=1&limit=12`);
      const elapsed = performance.now() - start;
      times.push(elapsed);
      expect(res.ok).toBe(true);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

    console.log(`  Response time — avg: ${avg.toFixed(0)}ms | p95: ${p95.toFixed(0)}ms | max: ${max.toFixed(0)}ms`);
    expect(avg).toBeLessThanOrEqual(2000);
    expect(p95).toBeLessThanOrEqual(2000);
  }

  async postconditions() {
    await this.api.cleanupAll();
  }
}

test('LOAD-1: Response time ≤ 2 sec for GET /books [Performance]', async ({ authenticatedPage, api }) => {
  const t = new Load1(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

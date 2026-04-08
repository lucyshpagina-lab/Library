import { test, expect } from '../../fixtures/test.fixture';
import { BaseTest } from '../../helpers/BaseTest';

const API_URL = 'http://localhost:4000/api';

// Throughput test: fires 1000 concurrent requests and measures req/sec
class Load2 extends BaseTest {
  async preconditions() {}

  async execute() {
    const totalRequests = 1000;
    const batchSize = 100;
    let completed = 0;
    let failed = 0;

    const start = performance.now();

    for (let batch = 0; batch < totalRequests / batchSize; batch++) {
      const promises = Array.from({ length: batchSize }, () =>
        fetch(`${API_URL}/books?page=1&limit=12`)
          .then(res => {
            if (res.ok) completed++;
            else failed++;
          })
          .catch(() => { failed++; })
      );
      await Promise.all(promises);
    }

    const elapsed = (performance.now() - start) / 1000; // seconds
    const throughput = completed / elapsed;

    console.log(`  Throughput — ${throughput.toFixed(0)} req/sec | completed: ${completed} | failed: ${failed} | time: ${elapsed.toFixed(2)}s`);
    expect(throughput).toBeGreaterThanOrEqual(1000);
    expect(failed).toBe(0);
  }

  async postconditions() {
    await this.api.cleanupAll();
  }
}

test('LOAD-2: Throughput ≥ 1000 req/sec for GET /books [Performance]', async ({ authenticatedPage, api }) => {
  const t = new Load2(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

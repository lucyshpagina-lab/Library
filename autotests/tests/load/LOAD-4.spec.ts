import { test, expect } from '../../fixtures/test.fixture';
import { BaseTest } from '../../helpers/BaseTest';

const API_URL = 'http://localhost:4000/api';

// No packet loss: every request under heavy load must succeed (no dropped connections)
class Load4 extends BaseTest {
  async preconditions() {}

  async execute() {
    const totalRequests = 1000;
    const batchSize = 100;
    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let batch = 0; batch < totalRequests / batchSize; batch++) {
      const promises = Array.from({ length: batchSize }, (_, i) => {
        const reqIndex = batch * batchSize + i + 1;
        return fetch(`${API_URL}/books?page=1&limit=12`)
          .then(res => {
            if (res.ok) {
              succeeded++;
            } else {
              failed++;
              errors.push(`Request #${reqIndex}: HTTP ${res.status}`);
            }
          })
          .catch(err => {
            failed++;
            errors.push(`Request #${reqIndex}: ${err.message}`);
          });
      });
      await Promise.all(promises);
    }

    const lossRate = (failed / totalRequests) * 100;
    console.log(`  Packet loss — ${lossRate.toFixed(2)}% | succeeded: ${succeeded}/${totalRequests} | failed: ${failed}`);
    if (errors.length > 0) {
      console.log(`  First 5 errors: ${errors.slice(0, 5).join('; ')}`);
    }

    expect(failed).toBe(0);
    expect(succeeded).toBe(totalRequests);
  }

  async postconditions() {
    await this.api.cleanupAll();
  }
}

test('LOAD-4: No packet loss under load (1000 requests) [Performance]', async ({ authenticatedPage, api }) => {
  const t = new Load4(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

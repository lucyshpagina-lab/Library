import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
const API_URL = 'http://localhost:4000/api';

// Throughput test: fires 1000 concurrent requests and measures req/sec

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup — testing against seeded data
  }
}

class Test extends BaseTest {
  async execute() {
    const totalRequests = 1000;
    const batchSize = 100;
    let completed = 0;
    let failed = 0;

    const start = performance.now();

    for (let batch = 0; batch < totalRequests / batchSize; batch++) {
      const promises = Array.from({ length: batchSize }, () =>
        fetch(`${API_URL}/books?page=1&limit=12`)
          .then((res) => {
            if (res.ok) completed++;
            else failed++;
          })
          .catch(() => {
            failed++;
          }),
      );
      await Promise.all(promises);
    }

    const elapsed = (performance.now() - start) / 1000;
    const throughput = completed / elapsed;

    console.log(
      `  Throughput — ${throughput.toFixed(0)} req/sec | completed: ${completed} | failed: ${failed} | time: ${elapsed.toFixed(2)}s`,
    );
    expect(throughput).toBeGreaterThanOrEqual(1000);
    expect(failed).toBe(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('LOAD-2: Throughput ≥ 1000 req/sec for GET /books [Performance]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

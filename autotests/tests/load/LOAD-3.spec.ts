import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTestAction, BasePostconditions } from '../../helpers/BaseTest';
import * as os from 'os';

const API_URL = 'http://localhost:4000/api';

// CPU usage test: monitors CPU while sending sustained load

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup — testing against seeded data
  }
}

class TestAction extends BaseTestAction {
  private getCpuUsage(): number {
    try {
      const cpus = os.cpus();
      const total = cpus.reduce((acc, cpu) => {
        const t = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        acc.total += t;
        acc.idle += idle;
        return acc;
      }, { total: 0, idle: 0 });
      return ((total.total - total.idle) / total.total) * 100;
    } catch {
      return 0;
    }
  }

  async execute() {
    const samples: number[] = [];
    const duration = 5000;
    const start = performance.now();

    while (performance.now() - start < duration) {
      const batch = Array.from({ length: 50 }, () =>
        fetch(`${API_URL}/books?page=1&limit=12`).catch(() => {})
      );
      await Promise.all(batch);
      samples.push(this.getCpuUsage());
    }

    const avgCpu = samples.reduce((a, b) => a + b, 0) / samples.length;
    const maxCpu = Math.max(...samples);

    console.log(`  CPU usage — avg: ${avgCpu.toFixed(1)}% | max: ${maxCpu.toFixed(1)}% | samples: ${samples.length}`);
    expect(maxCpu).toBeLessThanOrEqual(80);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('LOAD-3: CPU ≤ 80% under sustained load [Performance]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  const action = new TestAction(authenticatedPage);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

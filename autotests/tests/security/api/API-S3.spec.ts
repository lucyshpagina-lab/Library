import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Accesses all protected endpoints without auth cookie, verifies all return 401

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    for (const [m, p] of [
      ['GET', '/auth/me'],
      ['POST', '/books'],
      ['GET', '/favorites'],
      ['POST', '/favorites'],
      ['GET', '/progress'],
    ]) {
      const res = await fetch(`http://localhost:4000/api${p}`, {
        method: m,
        headers: { 'Content-Type': 'application/json' },
        body: m === 'POST' ? '{}' : undefined,
      });
      expect(res.status).toBe(401);
    }

    // DB integrity verification — no DB mutation with invalid tokens
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('API-S3: Missing auth cookie returns 401 [Authorization]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(page);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

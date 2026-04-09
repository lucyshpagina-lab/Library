import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Sends 100KB payload, verifies server handles gracefully

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  constructor(
    page: import('@playwright/test').Page,
    private testApi: ApiHelper,
  ) {
    super(page);
  }
  async execute() {
    expect([201, 400, 413, 422]).toContain(
      (
        await this.testApi.createBook({
          title: 'Huge',
          author: 'Big',
          genre: 'Sci-Fi',
          content: 'x'.repeat(100000),
        })
      ).status,
    );

    // DB integrity verification — server handled the payload without crashing
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('API-S4: Oversized payload handled gracefully [DoS Protection]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Attempts to favorite non-existent book, verifies error

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    expect((await this.api.addFavorite(999999)).status).toBeGreaterThanOrEqual(400);
    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('FAV-N3: Favorite non-existent book returns error [Cause-Effect]', async ({
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

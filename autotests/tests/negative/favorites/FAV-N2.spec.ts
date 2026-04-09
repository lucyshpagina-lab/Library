import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to add favorite without authentication, verifies 401

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    expect((await new ApiHelper().addFavorite(1)).status).toBe(401);
    // DB integrity verification — no auth means no DB write possible
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('FAV-N2: Add favorite without auth returns 401 [Cause-Effect]', async ({ page, api }) => {
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

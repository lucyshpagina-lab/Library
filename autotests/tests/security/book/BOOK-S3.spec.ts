import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to delete book without authentication, verifies 401

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    expect((await new ApiHelper().deleteBook(1)).status).toBe(401);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('BOOK-S3: Delete book without auth returns 401 [Authorization]', async ({ page, api }) => {
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

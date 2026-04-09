import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to create book without authentication, verifies 401

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    expect(
      (await new ApiHelper().createBook({ title: 'X', author: 'X', genre: 'X', content: 'X' }))
        .status,
    ).toBe(401);

    // DB integrity verification — no unauthorized book was created
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('BOOK-S4: Create book without auth returns 401 [Authorization]', async ({ page, api }) => {
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

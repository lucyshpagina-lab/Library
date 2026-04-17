import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { ApiHelper } from '../../helpers/api';

// Negative: short username (2 chars) does not create user in database

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    await api.register('short-db@test.com', 'ab', 'Password123!');
    const dbUser = await this.db.findUserByUsername('ab');
    expect(dbUser).toBeNull();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-AUTH-3: Short username rejected, no DB record [DB]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(page);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

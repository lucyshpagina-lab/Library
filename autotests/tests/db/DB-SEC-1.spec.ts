import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// SQL injection in login does not create user in database

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const sqlUser = await this.db.findUserByEmail("' OR 1=1 --");
    expect(sqlUser).toBeNull();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('DB-SEC-1: SQL injection login does not create DB record [DB]', async ({ page, api }) => {
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

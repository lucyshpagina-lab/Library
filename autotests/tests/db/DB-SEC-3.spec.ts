import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { ApiHelper } from '../../helpers/api';

// SQL injection in registration does not drop tables

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    await api.register("admin'--@test.com", "admin'; DROP TABLE users;--", "' OR '1'='1");
    const tables = await this.db.rawQuery(
      "SELECT COUNT(*)::int as count FROM information_schema.tables WHERE table_name = 'users'",
    );
    expect(tables[0].count).toBe(1);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('DB-SEC-3: SQL injection does not drop users table [DB]', async ({ page, api }) => {
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

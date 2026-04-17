import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Catalog: Fantasy book count matches database

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const dbCount = await this.db.rawQuery(
      "SELECT COUNT(*)::int as count FROM books WHERE genre = 'Fantasy'",
    );
    expect(dbCount[0].count).toBe(10);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-BOOKS-4: Fantasy genre count matches in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

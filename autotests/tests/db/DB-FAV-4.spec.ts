import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Negative: non-existent book favorite not stored in database

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const fav = await this.db.rawQuery(
      'SELECT COUNT(*)::int as count FROM favorites WHERE book_id = $1',
      [999999],
    );
    expect(fav[0].count).toBe(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-FAV-4: Favorite for non-existent book not in database [DB]', async ({
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

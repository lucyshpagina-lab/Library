import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Negative: duplicate favorite is not duplicated in database

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addFavorite(this.bookId);
    await this.api.addFavorite(this.bookId); // duplicate attempt
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    const me = await this.api.getMe();
    const userId = me.extract('user.id');
    const count = await this.db.countFavoritesByUserAndBook(userId, this.bookId);
    expect(count).toBe(1);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-FAV-3: Duplicate favorite not stored in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

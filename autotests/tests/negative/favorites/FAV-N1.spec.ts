import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Adds same book to favorites twice, verifies second attempt returns 409

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addFavorite(this.bookId);
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    expect((await this.api.addFavorite(this.bookId)).status).toBe(409);
    // DB integrity verification — only one favorite exists, not duplicated
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

test('FAV-N1: Add same book to favorites twice returns 409 [State Transition]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

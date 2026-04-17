import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { ApiHelper } from '../../helpers/api';

// Unauthorized delete does not remove book from database

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await new ApiHelper().deleteBook(this.bookId); // no auth
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    const dbBook = await this.db.findBookById(this.bookId);
    expect(dbBook).not.toBeNull();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-SEC-6: Unauthorized delete does not remove book from DB [DB]', async ({
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

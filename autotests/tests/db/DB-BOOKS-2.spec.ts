import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Positive: deleted book is removed from database

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    const res = await this.api.createBook({
      title: 'Delete DB ' + Date.now(),
      author: 'Ghost',
      genre: 'Horror',
      content: 'Will be deleted.',
    });
    res.statusCode(201);
    this.bookId = res.extract('book.id');
    await this.api.deleteBook(this.bookId);
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    const dbBook = await this.db.findBookById(this.bookId);
    expect(dbBook).toBeNull();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-BOOKS-2: Deleted book does not exist in database [DB]', async ({
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

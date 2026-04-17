import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// XSS in book title is stored as plain text in database

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    const res = await this.api.createBook({
      title: '<img src=x onerror=alert("xss")>',
      author: 'Safe',
      genre: 'Horror',
      content: 'Normal.',
    });
    if (res.status === 201) this.bookId = res.extract('book.id');
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    if (this.bookId) {
      const dbBook = await this.db.findBookById(this.bookId);
      expect(dbBook).not.toBeNull();
      expect(dbBook.title).toBe('<img src=x onerror=alert("xss")>');
    }
  }
}

class Postconditions extends BasePostconditions {
  bookId!: number;
  async cleanup() {
    if (this.bookId) await this.api.deleteBook(this.bookId);
  }
}

test('DB-SEC-4: XSS in book title stored as plain text in DB [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  post.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';

// Creates book with XSS in title, verifies no script execution on UI

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
  constructor(
    page: import('@playwright/test').Page,
    private bookId: number,
  ) {
    super(page);
  }
  async execute() {
    if (this.bookId) {
      await new BookPage(this.page).open(this.bookId);
      expect(await this.page.locator('img[src="x"]').count()).toBe(0);
    }

    // DB integrity verification — book exists but XSS payload is stored as plain text, not executable
    if (this.bookId) {
      const dbBook = await this.db.findBookById(this.bookId);
      expect(dbBook).not.toBeNull();
      expect(dbBook.title).toBe('<img src=x onerror=alert("xss")>');
    }
  }
}

class Postconditions extends BasePostconditions {
  constructor(
    api: import('../../../helpers/api').ApiHelper,
    private bookId: number,
  ) {
    super(api);
  }
  async cleanup() {
    if (this.bookId) await this.api.deleteBook(this.bookId);
  }
}

test('BOOK-S1: XSS in book title is escaped on UI [XSS]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(authenticatedPage, pre.bookId);
  const post = new Postconditions(api, pre.bookId);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';

// Creates book with XSS in title, verifies no script execution on UI
class BookS1 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    const res = await this.api.createBook({ title: '<img src=x onerror=alert("xss")>', author: 'Safe', genre: 'Horror', content: 'Normal.' });
    if (res.status === 201) this.bookId = res.extract('book.id');
  }
  async execute() {
    if (this.bookId) {
      await new BookPage(this.page).open(this.bookId);
      expect(await this.page.locator('img[src="x"]').count()).toBe(0);
    }
  }
  async postconditions() { if (this.bookId) await this.api.deleteBook(this.bookId); }
}

test('BOOK-S1: XSS in book title is escaped on UI [XSS]', async ({ authenticatedPage, api }) => {
  const t = new BookS1(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

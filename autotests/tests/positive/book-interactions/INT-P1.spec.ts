import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';

// Adds comment via API, opens book page, verifies comment text visible
class IntP1 extends BaseTest {
  private bookId!: number;
  private comment = 'Test comment ' + Date.now();
  async preconditions() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
    (await this.api.addComment(this.bookId, this.comment)).statusCode(201);
  }
  async test() {
    await new BookPage(this.page).open(this.bookId);
    await expect(this.page.locator('#comments-section')).toContainText(this.comment);
  }
  async postconditions() {}
}

test('INT-P1: Add comment via API and verify on page [Use Case]', async ({ authenticatedPage, api }) => {
  const t = new IntP1(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

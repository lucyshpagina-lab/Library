import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';

// Adds XSS comment, verifies no script execution in comments
class BookS2 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addComment(this.bookId, '<script>document.cookie</script>');
  }
  async test() {
    await new BookPage(this.page).open(this.bookId);
    expect(await this.page.locator('#comments-section script').count()).toBe(0);
  }
  async postconditions() {}
}

test('BOOK-S2: XSS in comment text is escaped [XSS]', async ({ authenticatedPage, api }) => {
  const t = new BookS2(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

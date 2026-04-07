import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';

// Rates book 5 stars via API, opens book page, verifies rating displayed
class IntP2 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
    (await this.api.rateBook(this.bookId, 5)).statusCode(200);
  }
  async test() {
    await new BookPage(this.page).open(this.bookId);
    await expect(this.page.locator('text=/\\d+\\.\\d/').first()).toBeVisible();
  }
  async postconditions() {}
}

test('INT-P2: Rate book via API and verify rating on UI [State Transition]', async ({ authenticatedPage, api }) => {
  const t = new IntP2(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

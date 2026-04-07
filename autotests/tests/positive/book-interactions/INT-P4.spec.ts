import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { ApiHelper } from '../../../helpers/api';

// Clicks Books by Author action and verifies catalog opens
class IntP4 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    const api = new ApiHelper();
    this.bookId = (await api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
  async execute() {
    await new BookPage(this.page).open(this.bookId);
    await new BookPage(this.page).booksByAuthorAction.click();
    await this.page.waitForURL(/\/catalog/, { timeout: 10000 });
  }
  async postconditions() {}
}

test('INT-P4: Navigate to author books from book detail [Use Case]', async ({ page }) => {
  const t = new IntP4(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

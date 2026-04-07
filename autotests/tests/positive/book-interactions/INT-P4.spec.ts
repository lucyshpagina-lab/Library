import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';
import { ApiHelper } from '../../../helpers/api';

// Clicks Books by Author action and verifies catalog opens with author filter
test('INT-P4: Navigate to author books from book detail [Use Case]', async ({ page }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const api = new ApiHelper();
    const book = (await api.getBooks({ limit: '1' })).extract('books')[0];
    bookId = book.id;
  });

  await test.step('TEST', async () => {
    await new BookPage(page).open(bookId);
    await new BookPage(page).booksByAuthorAction.click();
    await page.waitForURL(/\/catalog/, { timeout: 10000 });
  });
});

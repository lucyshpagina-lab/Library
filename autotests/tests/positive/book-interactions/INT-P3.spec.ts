import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';
import { ApiHelper } from '../../../helpers/api';

// Clicks Read Book button on book detail page and verifies reader opens
test('INT-P3: Navigate to reader from book detail [Use Case]', async ({ page }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const api = new ApiHelper();
    const book = (await api.getBooks({ limit: '1' })).extract('books')[0];
    bookId = book.id;
  });

  await test.step('TEST', async () => {
    await new BookPage(page).open(bookId);
    await new BookPage(page).readButton.click();
    await page.waitForURL(`/read/${bookId}`);
    await expect(page.locator('article')).toBeVisible();
  });
});

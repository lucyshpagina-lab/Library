import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';

// Rates book 5 stars via API, opens book page, verifies rating is displayed
test('INT-P2: Rate book via API and verify rating on UI [State Transition]', async ({ authenticatedPage, api, bookSetup }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
    const res = await api.rateBook(bookId, 5);
    res.statusCode(200);
  });

  await test.step('TEST', async () => {
    await new BookPage(authenticatedPage).open(bookId);
    await expect(authenticatedPage.locator('text=/\\d+\\.\\d/').first()).toBeVisible();
  });
});

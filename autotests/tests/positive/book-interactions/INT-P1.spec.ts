import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';

// Adds comment via API, opens book page, verifies comment text is visible
test('INT-P1: Add comment via API and verify on page [Use Case]', async ({ authenticatedPage, api, bookSetup }) => {
  const commentText = 'Great test comment! ' + Date.now();
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
    const res = await api.addComment(bookId, commentText);
    res.statusCode(201);
  });

  await test.step('TEST', async () => {
    await new BookPage(authenticatedPage).open(bookId);
    await expect(authenticatedPage.locator('#comments-section')).toContainText(commentText);
  });
});

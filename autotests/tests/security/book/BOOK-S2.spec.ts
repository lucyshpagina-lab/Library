import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';

// Adds comment with XSS script tag via API, verifies no script execution in comments
test('BOOK-S2: XSS in comment text is escaped [XSS]', async ({ authenticatedPage, api, bookSetup }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
    await api.addComment(bookId, '<script>document.cookie</script>');
  });

  await test.step('TEST', async () => {
    await new BookPage(authenticatedPage).open(bookId);
    const dangerousScripts = await authenticatedPage.locator('#comments-section script').count();
    expect(dangerousScripts).toBe(0);
  });
});

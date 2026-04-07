import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';

// Creates book via API, opens book page, verifies title and author are visible, then deletes
test('CRUD-P1: Create book via API and verify on UI [Use Case]', async ({ authenticatedPage, bookSetup, bookCleanup }) => {
  let book: any;

  await test.step('PRECONDITIONS', async () => {
    book = await bookSetup.createTestBook();
  });

  await test.step('TEST', async () => {
    await new BookPage(authenticatedPage).open(book.id);
    await expect(new BookPage(authenticatedPage).title).toContainText(book.title, { timeout: 10000 });
    await expect(authenticatedPage.getByText('Test Author', { exact: true })).toBeVisible();
  });

  await test.step('POSTCONDITIONS', async () => {
    await bookCleanup.deleteBook(book.id);
  });
});

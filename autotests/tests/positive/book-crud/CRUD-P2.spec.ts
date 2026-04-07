import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';
import { AddBookPage } from '../../../pages/AddBookPage';

// Adds book via UI form, verifies redirect to detail page, then deletes via UI
test('CRUD-P2: Add book via UI form and verify redirect [Use Case]', async ({ authenticatedPage }) => {
  const title = 'UI Book ' + Date.now();

  await test.step('PRECONDITIONS', async () => {
    await new AddBookPage(authenticatedPage).open();
  });

  await test.step('TEST', async () => {
    const form = new AddBookPage(authenticatedPage);
    await form.fillBook({ title, author: 'UI Author', genre: 'Fantasy', content: 'UI test content.', pageCount: 200 });
    await form.submit();
    await authenticatedPage.waitForURL(/\/book\/\d+/, { timeout: 10000 });
    await expect(new BookPage(authenticatedPage).title).toContainText(title);
  });

  await test.step('POSTCONDITIONS', async () => {
    await new BookPage(authenticatedPage).deleteBook();
    await authenticatedPage.waitForURL('/catalog', { timeout: 10000 });
  });
});

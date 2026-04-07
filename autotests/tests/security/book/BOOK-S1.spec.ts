import { test, expect } from '../../../fixtures/test.fixture';
import { BookPage } from '../../../pages/BookPage';

// Creates book with XSS in title via API, verifies no script execution on UI
test('BOOK-S1: XSS in book title is escaped on UI [XSS]', async ({ authenticatedPage, api }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const res = await api.createBook({
      title: '<img src=x onerror=alert("xss")>',
      author: 'Safe Author',
      genre: 'Horror',
      content: 'Normal content.',
    });
    if (res.status === 201) bookId = res.extract('book.id');
  });

  await test.step('TEST', async () => {
    if (bookId!) {
      await new BookPage(authenticatedPage).open(bookId);
      const scripts = await authenticatedPage.locator('img[src="x"]').count();
      expect(scripts).toBe(0);
    }
  });

  await test.step('POSTCONDITIONS', async () => {
    if (bookId!) await api.deleteBook(bookId);
  });
});

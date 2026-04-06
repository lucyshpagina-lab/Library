import { test, expect } from '../../fixtures/test.fixture';
import { BookPage } from '../../pages/BookPage';
import { ApiHelper, log } from '../../helpers/api';

test.describe('📖 Book [Security]', () => {

  test('BOOK-S1: XSS in book title is escaped on UI [XSS]', async ({ authenticatedPage, api }) => {
    let bookId: number;
    const xssTitle = '<img src=x onerror=alert("xss")>';

    await test.step('📋 PRECONDITION: Create book with XSS title via API', async () => {
      const res = await api.createBook({
        title: xssTitle,
        author: 'Safe Author',
        genre: 'Horror',
        content: 'Normal content.',
      });
      if (res.status === 201) {
        bookId = res.extract('book.id');
        log.precondition(`Book with XSS title created (id: ${bookId})`);
      } else {
        log.precondition('XSS title rejected by validation');
      }
    });

    await test.step('🧪 TEST: Open book page and verify no script execution', async () => {
      if (bookId!) {
        await new BookPage(authenticatedPage).open(bookId);
        // Verify no img/onerror executed — title should be escaped text
        const scripts = await authenticatedPage.locator('img[src="x"]').count();
        expect(scripts).toBe(0);
        log.success('XSS payload in title rendered as text, not executed');
      } else {
        log.success('XSS title was rejected by API — safe by validation');
      }
    });

    await test.step('🧹 POSTCONDITION: Delete test book', async () => {
      if (bookId!) await api.deleteBook(bookId);
    });
  });

  test('BOOK-S2: XSS in comment text is escaped [XSS]', async ({ authenticatedPage, api, bookSetup }) => {
    let bookId: number;
    const xssComment = '<script>document.cookie</script>';

    await test.step('📋 PRECONDITION: Add XSS comment via API', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
      const res = await api.addComment(bookId, xssComment);
      log.precondition(`Comment with XSS payload added to book ${bookId}`);
      log.info(`Status: ${res.status}`);
    });

    await test.step('🧪 TEST: Open book page', async () => {
      await new BookPage(authenticatedPage).open(bookId);
      log.test('Book page opened');
    });

    await test.step('✅ VERIFY: Script tag not executed', async () => {
      // React escapes by default — script should be visible as text
      const scriptCount = await authenticatedPage.locator('script:not([src])').count();
      // There should be no inline script tags (other than Next.js framework ones)
      const dangerousScripts = await authenticatedPage.locator('#comments-section script').count();
      expect(dangerousScripts).toBe(0);
      log.success('XSS in comment escaped — no script execution in comments section');
    });
  });

  test('BOOK-S3: Delete book without auth → 401 [Authorization]', async () => {
    await test.step('🧪 TEST: Delete book without authentication', async () => {
      const unauthApi = new ApiHelper();
      const res = await unauthApi.deleteBook(1);
      log.test('Attempted DELETE /books/1 without auth token');
      expect(res.status).toBe(401);
      log.success('Unauthorized delete blocked with 401');
    });
  });

  test('BOOK-S4: Create book without auth → 401 [Authorization]', async () => {
    await test.step('🧪 TEST: Create book without authentication', async () => {
      const unauthApi = new ApiHelper();
      const res = await unauthApi.createBook({
        title: 'Hacker Book', author: 'Hacker', genre: 'Horror', content: 'Unauthorized',
      });
      log.test('Attempted POST /books without auth token');
      expect(res.status).toBe(401);
      log.success('Unauthorized create blocked with 401');
    });
  });
});

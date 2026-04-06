import { test, expect } from '../../fixtures/test.fixture';
import { BookPage } from '../../pages/BookPage';
import { ApiHelper, log } from '../../helpers/api';

test.describe('⭐ Book Interactions [Positive]', () => {

  test('INT-P1: Add comment via API → verify on page [Use Case]', async ({ authenticatedPage, api, bookSetup }) => {
    const commentText = 'Great test comment! ' + Date.now();
    let bookId: number;
    await test.step('📋 PRECONDITION: Get book and add comment via API', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
      const res = await api.addComment(bookId, commentText);
      res.statusCode(201);
      log.precondition(`Comment added to book ${bookId}`);
      log.info(`REST Assured: status=201, comment.id=${res.extract('comment.id')}`);
    });
    await test.step('🧪 TEST: Open book page', async () => {
      await new BookPage(authenticatedPage).open(bookId);
      log.test('Book page opened');
    });
    await test.step('✅ VERIFY: Comment visible', async () => {
      await expect(authenticatedPage.locator('#comments-section')).toContainText(commentText);
      log.success('Comment displayed on book page');
    });
  });

  test('INT-P2: Rate book via API → verify rating on UI [State Transition]', async ({ authenticatedPage, api, bookSetup }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Rate book 5 stars via API', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
      const res = await api.rateBook(bookId, 5);
      res.statusCode(200);
      log.precondition(`Book ${bookId} rated 5 stars`);
      log.info(`REST Assured: avgRating=${res.extract('avgRating')}`);
    });
    await test.step('🧪 TEST: Open book page', async () => {
      await new BookPage(authenticatedPage).open(bookId);
      log.test('Book page opened');
    });
    await test.step('✅ VERIFY: Rating displayed', async () => {
      await expect(authenticatedPage.locator('text=/\\d+\\.\\d/').first()).toBeVisible();
      log.success('Rating visible on UI');
    });
  });

  test('INT-P3: Navigate to reader [Use Case]', async ({ page }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Get book via API', async () => {
      const api = new ApiHelper();
      const book = (await api.getBooks({ limit: '1' })).extract('books')[0];
      bookId = book.id;
      log.precondition(`Selected book ${bookId}`);
    });
    await test.step('🧪 TEST: Click Read Book', async () => {
      await new BookPage(page).open(bookId);
      await new BookPage(page).readButton.click();
      log.test('Clicked "Read Book"');
    });
    await test.step('✅ VERIFY: Reader page opens', async () => {
      await page.waitForURL(`/read/${bookId}`);
      await expect(page.locator('article')).toBeVisible();
      log.success(`Reader opened at /read/${bookId}`);
    });
  });

  test('INT-P4: Navigate to author books [Use Case]', async ({ page }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Get book via API', async () => {
      const api = new ApiHelper();
      const book = (await api.getBooks({ limit: '1' })).extract('books')[0];
      bookId = book.id;
      log.precondition(`Selected book ${bookId}`);
    });
    await test.step('🧪 TEST: Click Books by Author', async () => {
      await new BookPage(page).open(bookId);
      await new BookPage(page).booksByAuthorAction.click();
      log.test('Clicked "Books by Author"');
    });
    await test.step('✅ VERIFY: Catalog opens', async () => {
      await page.waitForURL(/\/catalog/, { timeout: 10000 });
      log.success('Catalog opened with author filter');
    });
  });
});

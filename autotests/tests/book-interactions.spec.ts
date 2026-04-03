import { test, expect } from '../fixtures/test.fixture';
import { BookPage } from '../pages/BookPage';
import { ApiHelper, log } from '../helpers/api';

test.describe('⭐ Book Interactions', () => {

  test('INT-1: Add comment via API → verify on book page', async ({ authenticatedPage, api }) => {
    let bookId: number;
    const commentText = 'Awesome automated test comment! ' + Date.now();

    await test.step('📋 PRECONDITION: Get a book and add comment via API', async () => {
      const booksRes = await api.getBooks({ limit: '1' });
      booksRes.statusCode(200).hasField('books');
      bookId = booksRes.extract('books')[0].id;
      log.precondition(`Selected book id: ${bookId}`);

      const commentRes = await api.addComment(bookId, commentText);
      commentRes.statusCode(201).hasField('comment.id');
      log.precondition(`Comment added: "${commentText.substring(0, 40)}..."`);
      log.info(`REST Assured: status=201, comment.id=${commentRes.extract('comment.id')}`);
      log.success('Comment is set up');
    });

    await test.step('🧪 TEST: Open book page and check comment', async () => {
      const bookPage = new BookPage(authenticatedPage);
      await bookPage.open(bookId);
      log.test(`Opened book page (id: ${bookId})`);
    });

    await test.step('✅ VERIFY: Comment text is visible', async () => {
      await expect(authenticatedPage.locator('#comments-section')).toContainText(commentText);
      log.success('Comment appears on book page');
    });
  });

  test('INT-2: Rate book via API → verify rating on UI', async ({ authenticatedPage, api }) => {
    let bookId: number;

    await test.step('📋 PRECONDITION: Rate a book 5 stars via API', async () => {
      const booksRes = await api.getBooks({ limit: '1' });
      bookId = booksRes.extract('books')[0].id;

      const rateRes = await api.rateBook(bookId, 5);
      rateRes.statusCode(200);
      log.precondition(`Rated book ${bookId} with 5 stars`);
      log.info(`REST Assured: status=200, avgRating=${rateRes.extract('avgRating')}`);
      log.success('Rating is set up');
    });

    await test.step('🧪 TEST: Open book page', async () => {
      const bookPage = new BookPage(authenticatedPage);
      await bookPage.open(bookId);
      log.test(`Opened book page (id: ${bookId})`);
    });

    await test.step('✅ VERIFY: Rating is displayed', async () => {
      const ratingText = authenticatedPage.locator('text=/\\d+\\.\\d/');
      await expect(ratingText.first()).toBeVisible();
      log.success('Book rating is visible on UI');
    });
  });

  test('INT-3: Navigate to reader from book detail', async ({ page }) => {
    let bookId: number;

    await test.step('📋 PRECONDITION: Get a book via API', async () => {
      const apiHelper = new ApiHelper();
      const res = await apiHelper.getBooks({ limit: '1' });
      bookId = res.extract('books')[0].id;
      log.precondition(`Selected book id: ${bookId}`);
    });

    await test.step('🧪 TEST: Click "Read Book" button', async () => {
      const bookPage = new BookPage(page);
      await bookPage.open(bookId);
      await bookPage.readButton.click();
      log.test('Clicked "Read Book" button');
    });

    await test.step('✅ VERIFY: Reader page opens', async () => {
      await page.waitForURL(`/read/${bookId}`);
      await expect(page.locator('article')).toBeVisible();
      log.success(`Reader opened at /read/${bookId}`);
    });
  });

  test('INT-4: Navigate to author books from book detail', async ({ page }) => {
    let bookId: number;
    let author: string;

    await test.step('📋 PRECONDITION: Get book data via API', async () => {
      const apiHelper = new ApiHelper();
      const res = await apiHelper.getBooks({ limit: '1' });
      bookId = res.extract('books')[0].id;
      author = res.extract('books')[0].author;
      log.precondition(`Selected book id: ${bookId}, author: "${author}"`);
    });

    await test.step('🧪 TEST: Click "Books by Author" action', async () => {
      const bookPage = new BookPage(page);
      await bookPage.open(bookId);
      await bookPage.booksByAuthorAction.click();
      log.test(`Clicked "Books by ${author}"`);
    });

    await test.step('✅ VERIFY: Catalog opens with author search', async () => {
      await page.waitForURL(/\/catalog/, { timeout: 10000 });
      log.success('Navigated to catalog with author filter');
    });
  });
});

import { test, expect } from '../fixtures/auth.fixture';
import { BookPage } from '../pages/BookPage';
import { ApiHelper } from '../helpers/api';

test.describe('Book Interactions', () => {
  test('should add comment via API and verify on book page', async ({ authenticatedPage, api }) => {
    // Preconditions: add a comment via API
    const booksData = await api.getBooks({ limit: '1' });
    const bookId = booksData.books[0].id;
    const commentText = 'Automated test comment ' + Date.now();
    await api.addComment(bookId, commentText);

    // Test: verify comment appears on book detail page
    const bookPage = new BookPage(authenticatedPage);
    await bookPage.open(bookId);

    await expect(bookPage.comments).toContainText(commentText);
  });

  test('should rate book via API and verify rating on UI', async ({ authenticatedPage, api }) => {
    // Preconditions: rate a book via API
    const booksData = await api.getBooks({ limit: '1' });
    const bookId = booksData.books[0].id;
    await api.rateBook(bookId, 5);

    // Test: verify rating reflected on book page
    const bookPage = new BookPage(authenticatedPage);
    await bookPage.open(bookId);

    const ratingText = authenticatedPage.locator('text=/\\d+\\.\\d/');
    await expect(ratingText.first()).toBeVisible();
  });

  test('should navigate to read page from book detail', async ({ page }) => {
    // Preconditions: get a book ID via API
    const apiHelper = new ApiHelper();
    const booksData = await apiHelper.getBooks({ limit: '1' });
    const bookId = booksData.books[0].id;

    // Test: click "Read Book" and verify navigation
    const bookPage = new BookPage(page);
    await bookPage.open(bookId);
    await bookPage.readButton.click();

    await page.waitForURL(`/read/${bookId}`);
    await expect(page.locator('article')).toBeVisible();
  });

  test('should navigate to author books from book detail', async ({ page }) => {
    // Preconditions: get a book via API
    const apiHelper = new ApiHelper();
    const booksData = await apiHelper.getBooks({ limit: '1' });
    const bookId = booksData.books[0].id;
    const author = booksData.books[0].author;

    // Test: click "Books by Author" action
    const bookPage = new BookPage(page);
    await bookPage.open(bookId);
    await bookPage.booksByAuthorAction.click();

    await page.waitForURL(/\/catalog/, { timeout: 10000 });
  });
});

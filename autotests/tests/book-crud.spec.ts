import { test, expect } from '../fixtures/auth.fixture';
import { BookPage } from '../pages/BookPage';
import { CatalogPage } from '../pages/CatalogPage';
import { AddBookPage } from '../pages/AddBookPage';

test.describe('Book CRUD', () => {
  test('should create a book via API and verify on UI', async ({ authenticatedPage, api }) => {
    // Preconditions: create book via API
    const bookData = {
      title: 'Autotest Book ' + Date.now(),
      author: 'Test Author',
      genre: 'Science Fiction',
      content: 'This is test content for the automated test book.',
      description: 'A book created by automated tests.',
      pageCount: 100,
      publishedYear: 2025,
    };
    const { book: createdBook } = await api.createBook(bookData);
    expect(createdBook.id).toBeTruthy();

    // Test: verify the book appears on the book detail page (no auth needed to view)
    await authenticatedPage.goto(`/book/${createdBook.id}`);
    await expect(authenticatedPage.locator('h1').first()).toContainText(bookData.title, { timeout: 10000 });

    // Cleanup via API
    await api.deleteBook(createdBook.id);
  });

  test('should add a book via UI form', async ({ authenticatedPage }) => {
    // Preconditions: user is authenticated

    // Test: fill and submit the add book form
    const addBookPage = new AddBookPage(authenticatedPage);
    await addBookPage.open();

    const title = 'UI Test Book ' + Date.now();
    await addBookPage.fillBook({
      title,
      author: 'UI Test Author',
      genre: 'Fantasy',
      content: 'Content written from the UI test.',
      description: 'A fantasy test book.',
      pageCount: 200,
    });
    await addBookPage.submit();

    // Verify redirected to book detail page
    await authenticatedPage.waitForURL(/\/book\/\d+/, { timeout: 10000 });
    const bookPage = new BookPage(authenticatedPage);
    await expect(bookPage.title).toContainText(title);

    // Cleanup: delete the book
    await bookPage.deleteBook();
    await authenticatedPage.waitForURL('/catalog', { timeout: 10000 });
  });

  test('should delete a book via API and verify gone on UI', async ({ page, api }) => {
    // Preconditions: create then delete book via API
    const bookTitle = 'Book To Delete ' + Date.now();
    const { book: createdBook } = await api.createBook({
      title: bookTitle,
      author: 'Delete Author',
      genre: 'Horror',
      content: 'This book will be deleted.',
    });
    await api.deleteBook(createdBook.id);

    // Test: verify book page shows error
    await page.goto(`/book/${createdBook.id}`);
    await expect(page.locator('text=/not found|Failed to load/i')).toBeVisible({ timeout: 10000 });
  });
});

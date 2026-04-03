import { test, expect } from '../fixtures/test.fixture';
import { BookPage } from '../pages/BookPage';
import { AddBookPage } from '../pages/AddBookPage';
import { log } from '../helpers/api';

test.describe('📖 Book CRUD', () => {

  test('CRUD-1: Create book via API → verify on UI → cleanup', async ({ authenticatedPage, api }) => {
    let bookId: number;
    const bookTitle = 'API Test Book ' + Date.now();

    await test.step('📋 PRECONDITION: Create book via REST API', async () => {
      const res = await api.createBook({
        title: bookTitle,
        author: 'Test Author',
        genre: 'Science Fiction',
        content: 'This is automated test content.',
        description: 'Created by automated tests.',
        pageCount: 100,
        publishedYear: 2025,
      });
      res.statusCode(201).hasField('book.id').hasField('book.title');
      bookId = res.extract('book.id');
      log.precondition(`Book "${bookTitle}" created via API (id: ${bookId})`);
      log.info(`REST Assured: status=201, book.id=${bookId}`);
      log.success('Book is set up');
    });

    await test.step('🧪 TEST: Open book detail page and verify content', async () => {
      const bookPage = new BookPage(authenticatedPage);
      await bookPage.open(bookId!);
      await expect(bookPage.title).toContainText(bookTitle, { timeout: 10000 });
      await expect(authenticatedPage.getByText('Test Author', { exact: true })).toBeVisible();
      log.test(`Book page opened for "${bookTitle}"`);
      log.success('Book title and author are visible on UI');
    });

    await test.step('🧹 POSTCONDITION: Delete book via API', async () => {
      await api.deleteBook(bookId!);
      log.postcondition(`Book "${bookTitle}" deleted (id: ${bookId})`);
      log.info('REST Assured: delete response received');
      log.success('Test book cleaned up');
    });
  });

  test('CRUD-2: Add book via UI form → verify redirect → cleanup', async ({ authenticatedPage }) => {
    const title = 'UI Created Book ' + Date.now();

    await test.step('📋 PRECONDITION: Navigate to Add Book page', async () => {
      const addBookPage = new AddBookPage(authenticatedPage);
      await addBookPage.open();
      log.precondition('Add Book page opened');
      log.success('Form is ready');
    });

    await test.step('🧪 TEST: Fill book form and submit', async () => {
      const addBookPage = new AddBookPage(authenticatedPage);
      await addBookPage.fillBook({
        title,
        author: 'UI Test Author',
        genre: 'Fantasy',
        content: 'Content from automated UI test.',
        description: 'A book added via UI test.',
        pageCount: 200,
      });
      await addBookPage.submit();
      log.test(`Filled and submitted form for "${title}"`);
    });

    await test.step('✅ VERIFY: Redirected to book detail page', async () => {
      await authenticatedPage.waitForURL(/\/book\/\d+/, { timeout: 10000 });
      const bookPage = new BookPage(authenticatedPage);
      await expect(bookPage.title).toContainText(title);
      log.test('Redirected to new book detail page');
      log.success('Book created via UI successfully');
    });

    await test.step('🧹 POSTCONDITION: Delete the book via UI', async () => {
      const bookPage = new BookPage(authenticatedPage);
      await bookPage.deleteBook();
      await authenticatedPage.waitForURL('/catalog', { timeout: 10000 });
      log.postcondition('Book deleted via UI');
      log.success('Test book cleaned up');
    });
  });

  test('CRUD-3: Delete book via API → verify gone on UI', async ({ page, api }) => {
    let bookId: number;
    const bookTitle = 'To Be Deleted ' + Date.now();

    await test.step('📋 PRECONDITION: Create book via API', async () => {
      const res = await api.createBook({
        title: bookTitle,
        author: 'Ghost Author',
        genre: 'Horror',
        content: 'This book will be deleted.',
      });
      res.statusCode(201);
      bookId = res.extract('book.id');
      log.precondition(`Book "${bookTitle}" created (id: ${bookId})`);
    });

    await test.step('📋 PRECONDITION: Delete book via API', async () => {
      await api.deleteBook(bookId!);
      log.precondition(`Book deleted via API (id: ${bookId})`);
      log.info('REST Assured: delete confirmed');
    });

    await test.step('🧪 TEST: Navigate to deleted book page', async () => {
      await page.goto(`/book/${bookId!}`);
      log.test(`Opened /book/${bookId}`);
    });

    await test.step('✅ VERIFY: "Not found" or error is shown', async () => {
      await expect(page.locator('text=/not found|Failed to load/i')).toBeVisible({ timeout: 10000 });
      log.success('Deleted book shows error state on UI');
    });
  });
});

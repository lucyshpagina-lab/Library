import { test, expect } from '../../fixtures/test.fixture';
import { BookPage } from '../../pages/BookPage';
import { AddBookPage } from '../../pages/AddBookPage';
import { log } from '../../helpers/api';

test.describe('📖 Book CRUD [Positive]', () => {

  test('CRUD-P1: Create book via API → verify on UI [Use Case]', async ({ authenticatedPage, bookSetup, bookCleanup }) => {
    let book: any;
    await test.step('📋 PRECONDITION: Create book via API', async () => {
      book = await bookSetup.createTestBook();
      log.info(`REST Assured: status=201, book.id=${book.id}`);
    });
    await test.step('🧪 TEST: Open book detail page', async () => {
      await new BookPage(authenticatedPage).open(book.id);
      log.test(`Navigated to /book/${book.id}`);
    });
    await test.step('✅ VERIFY: Title and author visible', async () => {
      await expect(new BookPage(authenticatedPage).title).toContainText(book.title, { timeout: 10000 });
      await expect(authenticatedPage.getByText('Test Author', { exact: true })).toBeVisible();
      log.success('Book details displayed correctly on UI');
    });
    await test.step('🧹 POSTCONDITION: Delete book', async () => {
      await bookCleanup.deleteBook(book.id);
    });
  });

  test('CRUD-P2: Add book via UI form → verify redirect [Use Case]', async ({ authenticatedPage }) => {
    const title = 'UI Book ' + Date.now();
    await test.step('📋 PRECONDITION: Open Add Book page', async () => {
      await new AddBookPage(authenticatedPage).open();
      log.precondition('Add Book form ready');
    });
    await test.step('🧪 TEST: Fill form and submit', async () => {
      const form = new AddBookPage(authenticatedPage);
      await form.fillBook({ title, author: 'UI Author', genre: 'Fantasy', content: 'UI test content.', pageCount: 200 });
      await form.submit();
      log.test(`Submitted book "${title}"`);
    });
    await test.step('✅ VERIFY: Redirected to book detail', async () => {
      await authenticatedPage.waitForURL(/\/book\/\d+/, { timeout: 10000 });
      await expect(new BookPage(authenticatedPage).title).toContainText(title);
      log.success('Book created and redirect confirmed');
    });
    await test.step('🧹 POSTCONDITION: Delete via UI', async () => {
      await new BookPage(authenticatedPage).deleteBook();
      await authenticatedPage.waitForURL('/catalog', { timeout: 10000 });
      log.postcondition('Book deleted via UI');
    });
  });

  test('CRUD-P3: Delete book via API → verify gone on UI [State Transition]', async ({ page, bookSetup, api }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Create and delete book via API', async () => {
      const book = await bookSetup.createTestBook({ title: 'To Be Deleted ' + Date.now() });
      bookId = book.id;
      await api.deleteBook(bookId);
      log.precondition(`Book created and deleted (id: ${bookId})`);
    });
    await test.step('🧪 TEST: Navigate to deleted book page', async () => {
      await page.goto(`/book/${bookId}`);
      log.test(`Opened /book/${bookId}`);
    });
    await test.step('✅ VERIFY: Error state shown', async () => {
      await expect(page.locator('text=/not found|Failed to load/i')).toBeVisible({ timeout: 10000 });
      log.success('Deleted book shows error on UI');
    });
  });
});

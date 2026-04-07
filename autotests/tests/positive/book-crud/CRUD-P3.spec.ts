import { test, expect } from '../../../fixtures/test.fixture';

// Creates book via API, deletes it, then verifies book page shows not found
test('CRUD-P3: Delete book via API and verify gone on UI [State Transition]', async ({ page, bookSetup, api }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.createTestBook({ title: 'To Be Deleted ' + Date.now() });
    bookId = book.id;
    await api.deleteBook(bookId);
  });

  await test.step('TEST', async () => {
    await page.goto(`/book/${bookId}`);
    await expect(page.locator('text=/not found|Failed to load/i')).toBeVisible({ timeout: 10000 });
  });
});

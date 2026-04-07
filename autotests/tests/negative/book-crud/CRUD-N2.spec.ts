import { test, expect } from '../../../fixtures/test.fixture';

// Rates book with value 0 (below min 1) via API, verifies rejection
test('CRUD-N2: Rating value 0 rejected below min [EP]', async ({ api, bookSetup }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
  });

  await test.step('TEST', async () => {
    const res = await api.rateBook(bookId, 0);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

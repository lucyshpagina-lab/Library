import { test, expect } from '../../../fixtures/test.fixture';

// Rates book with value 6 (above max 5) via API, verifies rejection
test('CRUD-N3: Rating value 6 rejected above max [EP]', async ({ api, bookSetup }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
  });

  await test.step('TEST', async () => {
    const res = await api.rateBook(bookId, 6);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

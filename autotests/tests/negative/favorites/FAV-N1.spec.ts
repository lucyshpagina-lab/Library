import { test, expect } from '../../../fixtures/test.fixture';

// Adds same book to favorites twice, verifies second attempt returns 409
test('FAV-N1: Add same book to favorites twice returns 409 [State Transition]', async ({ api, bookSetup }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
    await api.addFavorite(bookId);
  });

  await test.step('TEST', async () => {
    const res = await api.addFavorite(bookId);
    expect(res.status).toBe(409);
  });
});

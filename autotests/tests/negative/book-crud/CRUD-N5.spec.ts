import { test, expect } from '../../../fixtures/test.fixture';

// Submits 1001-char comment (max+1 boundary) via API, verifies rejection
test('CRUD-N5: Comment 1001 chars rejected max+1 [BVA]', async ({ api, bookSetup }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
  });

  await test.step('TEST', async () => {
    const res = await api.addComment(bookId, 'x'.repeat(1001));
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

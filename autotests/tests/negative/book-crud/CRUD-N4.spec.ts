import { test, expect } from '../../../fixtures/test.fixture';

// Submits empty comment (0 chars, min-1 boundary) via API, verifies rejection
test('CRUD-N4: Empty comment rejected 0 chars [BVA]', async ({ api, bookSetup }) => {
  let bookId: number;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookId = book.id;
  });

  await test.step('TEST', async () => {
    const res = await api.addComment(bookId, '');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

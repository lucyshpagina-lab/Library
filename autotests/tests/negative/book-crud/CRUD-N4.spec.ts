import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Submits empty comment (0 chars) via API, verifies rejection
class CrudN4 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
  async execute() {
    expect((await this.api.addComment(this.bookId, '')).status).toBeGreaterThanOrEqual(400);
    // DB integrity verification — empty comment was not stored
    const dbBook = await this.api.getBook(this.bookId);
    const emptyComments = dbBook.extract('book.comments').filter((c: any) => c.text === '');
    expect(emptyComments.length).toBe(0);
  }
  async postconditions() {}
}

test('CRUD-N4: Empty comment rejected 0 chars [BVA]', async ({ authenticatedPage, api }) => {
  const t = new CrudN4(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

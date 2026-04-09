import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Rates book with value 6 (above max 5) via API, verifies rejection
class CrudN3 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
  async execute() {
    expect((await this.api.rateBook(this.bookId, 6)).status).toBeGreaterThanOrEqual(400);
    // DB integrity verification — invalid rating was not stored
    const dbBook = await this.api.getBook(this.bookId);
    expect(dbBook.extract('userRating')).toBeNull();
  }
  async postconditions() {}
}

test('CRUD-N3: Rating value 6 rejected above max [EP]', async ({ authenticatedPage, api }) => {
  const t = new CrudN3(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

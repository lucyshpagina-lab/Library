import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Rates book with value 0 (below min 1) via API, verifies rejection
class CrudN2 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
  async execute() {
    expect((await this.api.rateBook(this.bookId, 0)).status).toBeGreaterThanOrEqual(400);
    // DB integrity verification — invalid rating was not stored
    const dbBook = await this.api.getBook(this.bookId);
    expect(dbBook.extract('userRating')).toBeNull();
  }
  async postconditions() {}
}

test('CRUD-N2: Rating value 0 rejected below min [EP]', async ({ authenticatedPage, api }) => {
  const t = new CrudN2(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

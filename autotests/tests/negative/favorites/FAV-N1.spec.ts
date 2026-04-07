import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Adds same book to favorites twice, verifies second attempt returns 409
class FavN1 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addFavorite(this.bookId);
  }
  async execute() { expect((await this.api.addFavorite(this.bookId)).status).toBe(409); }
  async postconditions() {}
}

test('FAV-N1: Add same book to favorites twice returns 409 [State Transition]', async ({ authenticatedPage, api }) => {
  const t = new FavN1(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

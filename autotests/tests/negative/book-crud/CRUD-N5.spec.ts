import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Submits 1001-char comment (max+1 boundary) via API, verifies rejection
class CrudN5 extends BaseTest {
  private bookId!: number;
  async preconditions() { this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id; }
  async test() { expect((await this.api.addComment(this.bookId, 'x'.repeat(1001))).status).toBeGreaterThanOrEqual(400); }
  async postconditions() {}
}

test('CRUD-N5: Comment 1001 chars rejected max+1 [BVA]', async ({ authenticatedPage, api }) => {
  const t = new CrudN5(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

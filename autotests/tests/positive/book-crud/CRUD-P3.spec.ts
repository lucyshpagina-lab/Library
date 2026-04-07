import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Creates book via API, deletes it, verifies book page shows not found
class CrudP3 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    const res = await this.api.createBook({ title: 'Delete ' + Date.now(), author: 'Ghost', genre: 'Horror', content: 'Will be deleted.' });
    res.statusCode(201);
    this.bookId = res.extract('book.id');
    await this.api.deleteBook(this.bookId);
  }
  async test() {
    await this.page.goto('/book/' + this.bookId);
    await expect(this.page.locator('text=/not found|Failed to load/i')).toBeVisible({ timeout: 10000 });
  }
  async postconditions() {}
}

test('CRUD-P3: Delete book via API and verify gone on UI [State Transition]', async ({ page, api }) => {
  const t = new CrudP3(page, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

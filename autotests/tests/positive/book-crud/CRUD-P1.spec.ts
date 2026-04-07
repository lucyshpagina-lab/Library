import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';

// Creates book via API, opens book page, verifies title and author visible, deletes
class CrudP1 extends BaseTest {
  private book: any;
  async preconditions() { this.book = await this.api.createBook({ title: 'API Test ' + Date.now(), author: 'Test Author', genre: 'Science Fiction', content: 'Test content.' }).then(r => { r.statusCode(201); return { id: r.extract('book.id'), title: r.extract('book.title') }; }); }
  async test() {
    await new BookPage(this.page).open(this.book.id);
    await expect(new BookPage(this.page).title).toContainText(this.book.title, { timeout: 10000 });
    await expect(this.page.getByText('Test Author', { exact: true })).toBeVisible();
  }
  async postconditions() { await this.api.deleteBook(this.book.id); }
}

test('CRUD-P1: Create book via API and verify on UI [Use Case]', async ({ authenticatedPage, api }) => {
  const t = new CrudP1(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

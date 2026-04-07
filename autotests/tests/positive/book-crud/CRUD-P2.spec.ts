import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { AddBookPage } from '../../../pages/AddBookPage';

// Adds book via UI form, verifies redirect to detail page, deletes via UI
class CrudP2 extends BaseTest {
  private title = 'UI Book ' + Date.now();
  async preconditions() { await new AddBookPage(this.page).open(); }
  async test() {
    const form = new AddBookPage(this.page);
    await form.fillBook({ title: this.title, author: 'UI Author', genre: 'Fantasy', content: 'UI test content.', pageCount: 200 });
    await form.submit();
    await this.page.waitForURL(/\/book\/\d+/, { timeout: 10000 });
    await expect(new BookPage(this.page).title).toContainText(this.title);
  }
  async postconditions() {
    await new BookPage(this.page).deleteBook();
    await this.page.waitForURL('/catalog', { timeout: 10000 });
  }
}

test('CRUD-P2: Add book via UI form and verify redirect [Use Case]', async ({ authenticatedPage, api }) => {
  const t = new CrudP2(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

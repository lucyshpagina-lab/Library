import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { AddBookPage } from '../../../pages/AddBookPage';
import { ApiHelper } from '../../../helpers/api';
import { Page } from '@playwright/test';

// Adds book via UI form, verifies redirect to detail page, deletes via UI

class Preconditions extends BasePreconditions {
  async setup() {
    // No API setup — book is created via UI in the test
  }
}

class Test extends BaseTest {
  title = 'UI Book ' + Date.now();

  async execute() {
    await new AddBookPage(this.page).open();
    const form = new AddBookPage(this.page);
    await form.fillBook({
      title: this.title,
      author: 'UI Author',
      genre: 'Fantasy',
      content: 'UI test content.',
      pageCount: 200,
    });
    await form.submit();
    await this.page.waitForURL(/\/book\/\d+/, { timeout: 10000 });
    await expect(new BookPage(this.page).title).toContainText(this.title);

    // DB integrity verification (API)
    const bookId = Number(this.page.url().match(/\/book\/(\d+)/)?.[1]);
    if (bookId) {
      const apiBook = await this.api.getBook(bookId);
      expect(apiBook.status).toBe(200);
      expect(apiBook.extract('book.title')).toBe(this.title);
    }

    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  constructor(
    api: ApiHelper,
    private page: Page,
  ) {
    super(api);
  }

  async cleanup() {
    await new BookPage(this.page).deleteBook();
    await this.page.waitForURL('/catalog', { timeout: 10000 });
    await this.api.cleanupAll();
  }
}

test('CRUD-P2: Add book via UI form and verify redirect [Use Case]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api, authenticatedPage);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

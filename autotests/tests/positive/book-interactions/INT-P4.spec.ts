import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { Page } from '@playwright/test';
import { ApiHelper } from '../../../helpers/api';

// Clicks Books by Author action and verifies catalog opens

class Preconditions extends BasePreconditions {
  bookId!: number;

  async setup() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
  }
}

class Test extends BaseTest {
  constructor(
    page: Page,
    private bookId: number,
    api: ApiHelper,
  ) {
    super(page, api);
  }

  async execute() {
    await new BookPage(this.page).open(this.bookId);
    await new BookPage(this.page).booksByAuthorAction.click();
    await this.page.waitForURL(/\/catalog/, { timeout: 10000 });

    // DB integrity verification — book exists with valid author
    const dbBook = await this.api.getBook(this.bookId);
    expect(dbBook.status).toBe(200);
    expect(dbBook.extract('book.author')).toBeTruthy();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('INT-P4: Navigate to author books from book detail [Use Case]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(page, pre.bookId, api);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { BookPage } from '../../pages/BookPage';
import { ApiHelper } from '../../helpers/api';
import { Page } from '@playwright/test';

// Regression: Add comment via API and verify on book page

class Preconditions extends BasePreconditions {
  bookId!: number;
  comment = 'Regression comment ' + Date.now();

  async setup() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
    (await this.api.addComment(this.bookId, this.comment)).statusCode(201);
  }
}

class Test extends BaseTest {
  constructor(
    page: Page,
    private bookId: number,
    private comment: string,
    api: ApiHelper,
  ) {
    super(page, api);
  }

  async execute() {
    await new BookPage(this.page).open(this.bookId);
    await expect(this.page.locator('#comments-section')).toContainText(this.comment);

    // DB integrity verification — comment FK to book
    const dbBook = await this.api.getBook(this.bookId);
    expect(dbBook.status).toBe(200);
    const comments = dbBook.extract('book.comments');
    expect(comments.some((c: any) => c.text === this.comment)).toBe(true);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('REG-5: Add comment and verify on page [Regression]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(authenticatedPage, pre.bookId, pre.comment, api);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

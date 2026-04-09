import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { Page } from '@playwright/test';
import { ApiHelper } from '../../../helpers/api';

// Adds comment via API, opens book page, verifies comment text visible

class Preconditions extends BasePreconditions {
  bookId!: number;
  comment = 'Test comment ' + Date.now();

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

    // DB integrity verification (API) — comment FK to book
    const apiBook = await this.api.getBook(this.bookId);
    expect(apiBook.status).toBe(200);
    const comments = apiBook.extract('book.comments');
    expect(comments.some((c: any) => c.text === this.comment)).toBe(true);

    // DB integrity verification (direct DB query)
    const dbComments = await this.db.findCommentsByBookId(this.bookId);
    expect(dbComments.some((c: any) => c.text === this.comment)).toBe(true);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('INT-P1: Add comment via API and verify on page [Use Case]', async ({
  authenticatedPage,
  api,
}) => {
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

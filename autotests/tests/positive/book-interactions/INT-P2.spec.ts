import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { Page } from '@playwright/test';
import { ApiHelper } from '../../../helpers/api';

// Rates book 5 stars via API, opens book page, verifies rating displayed

class Preconditions extends BasePreconditions {
  bookId!: number;

  async setup() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
    (await this.api.rateBook(this.bookId, 5)).statusCode(200);
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
    await expect(this.page.locator('text=/\\d+\\.\\d/').first()).toBeVisible();

    // DB integrity verification (API) — rating stored and avgRating updated
    const apiBook = await this.api.getBook(this.bookId);
    expect(apiBook.status).toBe(200);
    expect(apiBook.extract('book.ratingsCount')).toBeGreaterThanOrEqual(1);
    expect(apiBook.extract('book.avgRating')).toBeGreaterThanOrEqual(1);

    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('INT-P2: Rate book via API and verify rating on UI [State Transition]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(authenticatedPage, pre.bookId, api);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

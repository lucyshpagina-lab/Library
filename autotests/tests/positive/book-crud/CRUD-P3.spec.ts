import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { Page } from '@playwright/test';
import { ApiHelper } from '../../../helpers/api';

// Creates book via API, deletes it, verifies book page shows not found

class Preconditions extends BasePreconditions {
  bookId!: number;

  async setup() {
    const res = await this.api.createBook({
      title: 'Delete ' + Date.now(),
      author: 'Ghost',
      genre: 'Horror',
      content: 'Will be deleted.',
    });
    res.statusCode(201);
    this.bookId = res.extract('book.id');
    await this.api.deleteBook(this.bookId);
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
    await this.page.goto('/book/' + this.bookId);
    await expect(this.page.locator('text=/not found|Failed to load/i')).toBeVisible({
      timeout: 10000,
    });

    // DB integrity verification — book and its related data must not exist
    const dbBook = await this.api.getBook(this.bookId);
    expect(dbBook.status).toBe(404);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CRUD-P3: Delete book via API and verify gone on UI [State Transition]', async ({
  page,
  api,
}) => {
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

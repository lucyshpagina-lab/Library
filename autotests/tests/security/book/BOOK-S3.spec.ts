import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to delete book without authentication, verifies 401

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
  }
}

class Test extends BaseTest {
  constructor(
    page: import('@playwright/test').Page,
    api: ApiHelper,
    private bookId: number,
  ) {
    super(page, api);
  }
  async execute() {
    expect((await new ApiHelper().deleteBook(this.bookId)).status).toBe(401);

    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('BOOK-S3: Delete book without auth returns 401 [Authorization]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(page, api, pre.bookId);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { Page } from '@playwright/test';

// Clicks Read Book button and verifies reader opens

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
  ) {
    super(page);
  }

  async execute() {
    await new BookPage(this.page).open(this.bookId);
    await new BookPage(this.page).readButton.click();
    await this.page.waitForURL('/read/' + this.bookId);
    await expect(this.page.locator('article')).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('INT-P3: Navigate to reader from book detail [Use Case]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(page, pre.bookId);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

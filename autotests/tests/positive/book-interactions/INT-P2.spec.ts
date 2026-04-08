import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTestAction, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { Page } from '@playwright/test';

// Rates book 5 stars via API, opens book page, verifies rating displayed

class Preconditions extends BasePreconditions {
  bookId!: number;

  async setup() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
    (await this.api.rateBook(this.bookId, 5)).statusCode(200);
  }
}

class TestAction extends BaseTestAction {
  constructor(page: Page, private bookId: number) { super(page); }

  async execute() {
    await new BookPage(this.page).open(this.bookId);
    await expect(this.page.locator('text=/\\d+\\.\\d/').first()).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('INT-P2: Rate book via API and verify rating on UI [State Transition]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new TestAction(authenticatedPage, pre.bookId);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTestAction, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { Page } from '@playwright/test';

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

class TestAction extends BaseTestAction {
  constructor(page: Page, private bookId: number, private comment: string) { super(page); }

  async execute() {
    await new BookPage(this.page).open(this.bookId);
    await expect(this.page.locator('#comments-section')).toContainText(this.comment);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('INT-P1: Add comment via API and verify on page [Use Case]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new TestAction(authenticatedPage, pre.bookId, pre.comment);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

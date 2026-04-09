import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Submits 1001-char comment (max+1 boundary) via API, verifies rejection

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    expect(
      (await this.api.addComment(this.bookId, 'x'.repeat(1001))).status,
    ).toBeGreaterThanOrEqual(400);
    // DB integrity verification — oversized comment was not stored
    const dbBook = await this.api.getBook(this.bookId);
    const longComments = dbBook.extract('book.comments').filter((c: any) => c.text.length > 1000);
    expect(longComments.length).toBe(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('CRUD-N5: Comment 1001 chars rejected max+1 [BVA]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

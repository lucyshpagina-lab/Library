import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Submits empty comment (0 chars) via API, verifies rejection

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    expect((await this.api.addComment(this.bookId, '')).status).toBeGreaterThanOrEqual(400);
    // DB integrity verification — empty comment was not stored
    const comments = await this.db.findCommentsByBookId(this.bookId);
    const empty = comments.filter((c: any) => c.text === '');
    expect(empty.length).toBe(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('CRUD-N4: Empty comment rejected 0 chars [BVA]', async ({ authenticatedPage, api }) => {
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

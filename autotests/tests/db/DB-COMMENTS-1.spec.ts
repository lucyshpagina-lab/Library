import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Positive: added comment exists in database

class Preconditions extends BasePreconditions {
  bookId!: number;
  commentText = 'DB comment test ' + Date.now();
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    (await this.api.addComment(this.bookId, this.commentText)).statusCode(201);
  }
}

class Test extends BaseTest {
  bookId!: number;
  commentText!: string;
  async execute() {
    const dbComments = await this.db.findCommentsByBookId(this.bookId);
    expect(dbComments.some((c: any) => c.text === this.commentText)).toBe(true);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-COMMENTS-1: Added comment exists in database [DB]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  action.commentText = pre.commentText;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

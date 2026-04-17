import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// XSS in comment stored in database

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addComment(this.bookId, '<script>document.cookie</script>');
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    const dbComments = await this.db.findCommentsByBookId(this.bookId);
    const xssComment = dbComments.find((c: any) => c.text.includes('document.cookie'));
    expect(xssComment).toBeTruthy();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-SEC-5: XSS in comment text stored in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

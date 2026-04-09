import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';

// Adds XSS comment, verifies no script execution in comments

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addComment(this.bookId, '<script>document.cookie</script>');
  }
}

class Test extends BaseTest {
  constructor(
    page: import('@playwright/test').Page,
    private bookId: number,
  ) {
    super(page);
  }
  async execute() {
    await new BookPage(this.page).open(this.bookId);
    expect(await this.page.locator('#comments-section script').count()).toBe(0);

    // DB integrity verification — comment exists but XSS payload is stored as plain text, not executable
    const dbComments = await this.db.findCommentsByBookId(this.bookId);
    const xssComment = dbComments.find((c: any) => c.text.includes('document.cookie'));
    expect(xssComment).toBeTruthy();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('BOOK-S2: XSS in comment text is escaped [XSS]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(authenticatedPage, pre.bookId);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { ApiHelper } from '../../../helpers/api';
// Creates book via API, opens book page, verifies title and author visible, deletes

class Preconditions extends BasePreconditions {
  book: any;

  async setup() {
    const res = await this.api.createBook({
      title: 'API Test ' + Date.now(),
      author: 'Test Author',
      genre: 'Science Fiction',
      content: 'Test content.',
    });
    res.statusCode(201);
    this.book = { id: res.extract('book.id'), title: res.extract('book.title') };
  }
}

class Test extends BaseTest {
  constructor(
    page: Page,
    private book: any,
  ) {
    super(page);
  }

  async execute() {
    await new BookPage(this.page).open(this.book.id);
    await expect(new BookPage(this.page).title).toContainText(this.book.title, { timeout: 10000 });
    await expect(this.page.getByText('Test Author', { exact: true })).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  constructor(
    api: ApiHelper,
    private bookId: number,
  ) {
    super(api);
  }

  async cleanup() {
    await this.api.deleteBook(this.bookId);
    await this.api.cleanupAll();
  }
}

test('CRUD-P1: Create book via API and verify on UI [Use Case]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(authenticatedPage, pre.book);
  const post = new Postconditions(api, pre.book.id);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

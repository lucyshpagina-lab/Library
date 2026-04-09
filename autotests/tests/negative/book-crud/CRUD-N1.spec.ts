import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Creates book with empty title via API, verifies rejection

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    const res = await this.api.createBook({
      title: '',
      author: 'Author',
      genre: 'Horror',
      content: 'Content',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    // DB integrity verification — no book with empty title was created
    const books = await this.api.getBooks({ search: '' });
    const emptyTitleBooks = books.extract('books').filter((b: any) => b.title === '');
    expect(emptyTitleBooks.length).toBe(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('CRUD-N1: Create book with empty title rejected [EP]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

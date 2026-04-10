import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Positive: created book exists in database with correct fields

class Preconditions extends BasePreconditions {
  bookId!: number;
  bookTitle = 'DB Test Book ' + Date.now();
  async setup() {
    const res = await this.api.createBook({
      title: this.bookTitle,
      author: 'DB Author',
      genre: 'Science Fiction',
      content: 'Test content for DB verification.',
    });
    res.statusCode(201);
    this.bookId = res.extract('book.id');
  }
}

class Test extends BaseTest {
  bookId!: number;
  bookTitle!: string;
  async execute() {
    const dbBook = await this.db.findBookById(this.bookId);
    expect(dbBook).not.toBeNull();
    expect(dbBook.title).toBe(this.bookTitle);
    expect(dbBook.author).toBe('DB Author');
    expect(dbBook.genre).toBe('Science Fiction');
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-BOOKS-1: Created book exists in database with correct fields [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  action.bookTitle = pre.bookTitle;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

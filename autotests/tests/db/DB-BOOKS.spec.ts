import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// DB integrity tests for books — verifies book records via direct PostgreSQL queries

class NoopPre extends BasePreconditions {
  async setup() {}
}

// ── Positive: created book exists in DB ──

class CreateBookPre extends BasePreconditions {
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

class VerifyBookExists extends BaseTest {
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

class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-BOOKS-1: Created book exists in database with correct fields [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new CreateBookPre(api);
  const action = new VerifyBookExists(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  action.bookTitle = pre.bookTitle;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Positive: deleted book is removed from DB ──

class CreateAndDeletePre extends BasePreconditions {
  bookId!: number;
  async setup() {
    const res = await this.api.createBook({
      title: 'Delete DB ' + Date.now(),
      author: 'Ghost',
      genre: 'Horror',
      content: 'Will be deleted.',
    });
    res.statusCode(201);
    this.bookId = res.extract('book.id');
    await this.api.deleteBook(this.bookId);
  }
}

class VerifyBookDeleted extends BaseTest {
  bookId!: number;
  async execute() {
    const dbBook = await this.db.findBookById(this.bookId);
    expect(dbBook).toBeNull();
  }
}

test('DB-BOOKS-2: Deleted book does not exist in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new CreateAndDeletePre(api);
  const action = new VerifyBookDeleted(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: empty title book not persisted ──

class VerifyNoEmptyTitle extends BaseTest {
  async execute() {
    await this.api.createBook({ title: '', author: 'Author', genre: 'Horror', content: 'Content' });
    const count = await this.db.countBooksByTitle('');
    expect(count).toBe(0);
  }
}

test('DB-BOOKS-3: Empty title book rejected, no DB record [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new VerifyNoEmptyTitle(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Catalog: Fantasy book count matches DB ──

class VerifyGenreCount extends BaseTest {
  async execute() {
    const dbCount = await this.db.rawQuery(
      "SELECT COUNT(*)::int as count FROM books WHERE genre = 'Fantasy'",
    );
    expect(dbCount[0].count).toBe(10);
  }
}

test('DB-BOOKS-4: Fantasy genre count matches in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new VerifyGenreCount(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Search: Dune exists in DB ──

class VerifySearchInDb extends BaseTest {
  async execute() {
    const dbBooks = await this.db.rawQuery("SELECT * FROM books WHERE title ILIKE '%Dune%'");
    expect(dbBooks.length).toBeGreaterThan(0);
  }
}

test('DB-BOOKS-5: Search term "Dune" matches database records [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new VerifySearchInDb(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

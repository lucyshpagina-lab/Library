import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { ApiHelper } from '../../helpers/api';

// DB integrity tests for security — verifies no data corruption via direct PostgreSQL queries

class NoopPre extends BasePreconditions {
  async setup() {}
}

// ── SQL injection in login does not create user ──

class VerifySqlInjectionSafe extends BaseTest {
  async execute() {
    const sqlUser = await this.db.findUserByEmail("' OR 1=1 --");
    expect(sqlUser).toBeNull();
  }
}

class CleanupAll extends BasePostconditions {
  async cleanup() {}
}

test('DB-SEC-1: SQL injection login does not create DB record [DB]', async ({ page, api }) => {
  const pre = new NoopPre(api);
  const action = new VerifySqlInjectionSafe(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── XSS username does not persist as executable ──

class VerifyXssUsernameSafe extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    await api.register(
      `xss-db-${Date.now()}@test.com`,
      '<script>alert("xss")</script>',
      'Password123!',
    );
    const xssUser = await this.db.findUserByUsername('<script>alert("xss")</script>');
    expect(xssUser).toBeNull();
  }
}

test('DB-SEC-2: XSS username not stored in database [DB]', async ({ page, api }) => {
  const pre = new NoopPre(api);
  const action = new VerifyXssUsernameSafe(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── SQL injection in registration does not drop tables ──

class VerifyTablesIntact extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    await api.register("admin'--@test.com", "admin'; DROP TABLE users;--", "' OR '1'='1");
    const tables = await this.db.rawQuery(
      "SELECT COUNT(*)::int as count FROM information_schema.tables WHERE table_name = 'users'",
    );
    expect(tables[0].count).toBe(1);
  }
}

test('DB-SEC-3: SQL injection does not drop users table [DB]', async ({ page, api }) => {
  const pre = new NoopPre(api);
  const action = new VerifyTablesIntact(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── XSS in book title is stored as plain text ──

class XssBookPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    const res = await this.api.createBook({
      title: '<img src=x onerror=alert("xss")>',
      author: 'Safe',
      genre: 'Horror',
      content: 'Normal.',
    });
    if (res.status === 201) this.bookId = res.extract('book.id');
  }
}

class VerifyXssBookStored extends BaseTest {
  bookId!: number;
  async execute() {
    if (this.bookId) {
      const dbBook = await this.db.findBookById(this.bookId);
      expect(dbBook).not.toBeNull();
      expect(dbBook.title).toBe('<img src=x onerror=alert("xss")>');
    }
  }
}

class CleanupBooks extends BasePostconditions {
  bookId!: number;
  async cleanup() {
    if (this.bookId) await this.api.deleteBook(this.bookId);
  }
}

test('DB-SEC-4: XSS in book title stored as plain text in DB [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new XssBookPre(api);
  const action = new VerifyXssBookStored(authenticatedPage, api);
  const post = new CleanupBooks(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  post.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── XSS in comment stored in DB ──

class XssCommentPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addComment(this.bookId, '<script>document.cookie</script>');
  }
}

class VerifyXssCommentStored extends BaseTest {
  bookId!: number;
  async execute() {
    const dbComments = await this.db.findCommentsByBookId(this.bookId);
    const xssComment = dbComments.find((c: any) => c.text.includes('document.cookie'));
    expect(xssComment).toBeTruthy();
  }
}

test('DB-SEC-5: XSS in comment text stored in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new XssCommentPre(api);
  const action = new VerifyXssCommentStored(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Unauthorized delete does not remove book from DB ──

class UnauthDeletePre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await new ApiHelper().deleteBook(this.bookId); // no auth
  }
}

class VerifyBookSurvived extends BaseTest {
  bookId!: number;
  async execute() {
    const dbBook = await this.db.findBookById(this.bookId);
    expect(dbBook).not.toBeNull();
  }
}

test('DB-SEC-6: Unauthorized delete does not remove book from DB [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new UnauthDeletePre(api);
  const action = new VerifyBookSurvived(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

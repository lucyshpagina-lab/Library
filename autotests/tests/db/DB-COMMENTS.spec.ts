import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// DB integrity tests for comments — verifies comment records via direct PostgreSQL queries

// ── Positive: added comment exists in DB ──

class AddCommentPre extends BasePreconditions {
  bookId!: number;
  commentText = 'DB comment test ' + Date.now();
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    (await this.api.addComment(this.bookId, this.commentText)).statusCode(201);
  }
}

class VerifyCommentExists extends BaseTest {
  bookId!: number;
  commentText!: string;
  async execute() {
    const dbComments = await this.db.findCommentsByBookId(this.bookId);
    expect(dbComments.some((c: any) => c.text === this.commentText)).toBe(true);
  }
}

class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-COMMENTS-1: Added comment exists in database [DB]', async ({ authenticatedPage, api }) => {
  const pre = new AddCommentPre(api);
  const action = new VerifyCommentExists(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  action.commentText = pre.commentText;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: empty comment not persisted ──

class EmptyCommentPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addComment(this.bookId, '');
  }
}

class VerifyNoEmptyComment extends BaseTest {
  bookId!: number;
  async execute() {
    const comments = await this.db.findCommentsByBookId(this.bookId);
    const empty = comments.filter((c: any) => c.text === '');
    expect(empty.length).toBe(0);
  }
}

test('DB-COMMENTS-2: Empty comment rejected, no DB record [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new EmptyCommentPre(api);
  const action = new VerifyNoEmptyComment(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: 1001-char comment not persisted ──

class LongCommentPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addComment(this.bookId, 'x'.repeat(1001));
  }
}

class VerifyNoLongComment extends BaseTest {
  bookId!: number;
  async execute() {
    const comments = await this.db.findCommentsByBookId(this.bookId);
    const long = comments.filter((c: any) => c.text.length > 1000);
    expect(long.length).toBe(0);
  }
}

test('DB-COMMENTS-3: Oversized comment rejected, no DB record [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new LongCommentPre(api);
  const action = new VerifyNoLongComment(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

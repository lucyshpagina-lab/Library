import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// DB integrity tests for ratings — verifies rating records via direct PostgreSQL queries

// ── Positive: valid rating exists in DB ──

class RateBookPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    (await this.api.rateBook(this.bookId, 5)).statusCode(200);
  }
}

class VerifyRatingExists extends BaseTest {
  bookId!: number;
  async execute() {
    const dbRatings = await this.db.findRatingsByBookId(this.bookId);
    expect(dbRatings.length).toBeGreaterThanOrEqual(1);
    expect(dbRatings.some((r: any) => r.value === 5)).toBe(true);
  }
}

class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-RATINGS-1: Valid rating persisted in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new RateBookPre(api);
  const action = new VerifyRatingExists(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: rating 0 not persisted ──

class RateZeroPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.rateBook(this.bookId, 0);
  }
}

class VerifyNoZeroRating extends BaseTest {
  bookId!: number;
  async execute() {
    const ratings = await this.db.findRatingsByBookId(this.bookId);
    const zeroRatings = ratings.filter((r: any) => r.value === 0);
    expect(zeroRatings.length).toBe(0);
  }
}

test('DB-RATINGS-2: Rating value 0 rejected, no DB record [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new RateZeroPre(api);
  const action = new VerifyNoZeroRating(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: rating 6 not persisted ──

class RateSixPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.rateBook(this.bookId, 6);
  }
}

class VerifyNoSixRating extends BaseTest {
  bookId!: number;
  async execute() {
    const ratings = await this.db.findRatingsByBookId(this.bookId);
    const sixRatings = ratings.filter((r: any) => r.value === 6);
    expect(sixRatings.length).toBe(0);
  }
}

test('DB-RATINGS-3: Rating value 6 rejected, no DB record [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new RateSixPre(api);
  const action = new VerifyNoSixRating(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

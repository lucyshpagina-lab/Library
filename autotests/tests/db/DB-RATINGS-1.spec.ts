import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Positive: valid rating exists in database

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    (await this.api.rateBook(this.bookId, 5)).statusCode(200);
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    const dbRatings = await this.db.findRatingsByBookId(this.bookId);
    expect(dbRatings.length).toBeGreaterThanOrEqual(1);
    expect(dbRatings.some((r: any) => r.value === 5)).toBe(true);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-RATINGS-1: Valid rating persisted in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

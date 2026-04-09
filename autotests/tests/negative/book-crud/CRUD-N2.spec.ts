import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Rates book with value 0 (below min 1) via API, verifies rejection

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    expect((await this.api.rateBook(this.bookId, 0)).status).toBeGreaterThanOrEqual(400);
    // DB integrity verification — invalid rating was not stored
    const ratings = await this.db.findRatingsByBookId(this.bookId);
    const zeroRatings = ratings.filter((r: any) => r.value === 0);
    expect(zeroRatings.length).toBe(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('CRUD-N2: Rating value 0 rejected below min [EP]', async ({ authenticatedPage, api }) => {
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

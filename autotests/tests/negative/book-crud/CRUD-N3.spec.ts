import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Rates book with value 6 (above max 5) via API, verifies rejection

class Preconditions extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
}

class Test extends BaseTest {
  bookId!: number;
  async execute() {
    expect((await this.api.rateBook(this.bookId, 6)).status).toBeGreaterThanOrEqual(400);
    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('CRUD-N3: Rating value 6 rejected above max [EP]', async ({ authenticatedPage, api }) => {
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

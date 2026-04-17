import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Negative: empty title book not persisted in database

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    await this.api.createBook({ title: '', author: 'Author', genre: 'Horror', content: 'Content' });
    const count = await this.db.countBooksByTitle('');
    expect(count).toBe(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-BOOKS-3: Empty title book rejected, no DB record [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

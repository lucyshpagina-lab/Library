import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to create book without authentication, verifies 401
class BookS4 extends BaseTest {
  async preconditions() {}
  async test() { expect((await new ApiHelper().createBook({ title: 'X', author: 'X', genre: 'X', content: 'X' })).status).toBe(401); }
  async postconditions() {}
}

test('BOOK-S4: Create book without auth returns 401 [Authorization]', async ({ page }) => {
  const t = new BookS4(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

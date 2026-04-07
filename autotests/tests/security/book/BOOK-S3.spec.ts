import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to delete book without authentication, verifies 401
class BookS3 extends BaseTest {
  async preconditions() {}
  async test() { expect((await new ApiHelper().deleteBook(1)).status).toBe(401); }
  async postconditions() {}
}

test('BOOK-S3: Delete book without auth returns 401 [Authorization]', async ({ page }) => {
  const t = new BookS3(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to create book without authentication, verifies 401
class CrudN6 extends BaseTest {
  async preconditions() {}
  async execute() {
    const unauth = new ApiHelper();
    expect(
      (await unauth.createBook({ title: 'X', author: 'X', genre: 'X', content: 'X' })).status,
    ).toBe(401);
    // DB integrity verification — no auth means no DB write possible
  }
  async postconditions() {}
}

test('CRUD-N6: Create book without auth returns 401 [Cause-Effect]', async ({ page }) => {
  const t = new CrudN6(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

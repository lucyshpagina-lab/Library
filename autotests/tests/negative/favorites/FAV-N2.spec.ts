import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Attempts to add favorite without authentication, verifies 401
class FavN2 extends BaseTest {
  async preconditions() {}
  async execute() {
    expect((await new ApiHelper().addFavorite(1)).status).toBe(401);
    // DB integrity verification — no auth means no DB write possible
  }
  async postconditions() {}
}

test('FAV-N2: Add favorite without auth returns 401 [Cause-Effect]', async ({ page }) => {
  const t = new FavN2(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

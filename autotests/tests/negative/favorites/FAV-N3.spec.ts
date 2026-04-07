import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Attempts to favorite non-existent book, verifies error
class FavN3 extends BaseTest {
  async preconditions() {}
  async test() { expect((await this.api.addFavorite(999999)).status).toBeGreaterThanOrEqual(400); }
  async postconditions() {}
}

test('FAV-N3: Favorite non-existent book returns error [Cause-Effect]', async ({ authenticatedPage, api }) => {
  const t = new FavN3(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

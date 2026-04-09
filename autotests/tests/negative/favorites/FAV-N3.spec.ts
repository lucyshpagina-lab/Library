import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Attempts to favorite non-existent book, verifies error
class FavN3 extends BaseTest {
  async preconditions() {}
  async execute() {
    expect((await this.api.addFavorite(999999)).status).toBeGreaterThanOrEqual(400);
    // DB integrity verification — no favorite was created for non-existent book
    const favs = await this.api.getFavorites();
    const invalidFavs = favs.extract('favorites').filter((f: any) => f.book.id === 999999);
    expect(invalidFavs.length).toBe(0);
  }
  async postconditions() {}
}

test('FAV-N3: Favorite non-existent book returns error [Cause-Effect]', async ({
  authenticatedPage,
  api,
}) => {
  const t = new FavN3(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

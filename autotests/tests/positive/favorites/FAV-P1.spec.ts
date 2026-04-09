import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { FavoritesPage } from '../../../pages/FavoritesPage';

// Opens favorites page with no favorites and verifies broken heart empty state

class Preconditions extends BasePreconditions {
  async setup() {
    // No favorites to create — testing empty state
  }
}

class Test extends BaseTest {
  async execute() {
    const fav = new FavoritesPage(this.page);
    await fav.open();
    await expect(fav.brokenHeartEmoji).toBeVisible();
    await expect(fav.emptyState).toContainText('is poor since');

    // DB integrity verification (API) — no favorites in DB
    const favs = await this.api.getFavorites();
    expect(favs.status).toBe(200);
    expect(favs.extract('favorites')).toHaveLength(0);

    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('FAV-P1: Empty favorites shows broken heart [State Transition]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

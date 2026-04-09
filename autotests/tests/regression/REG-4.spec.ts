import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { FavoritesPage } from '../../pages/FavoritesPage';
import { ApiHelper } from '../../helpers/api';
import { Page } from '@playwright/test';

// Regression: Empty favorites shows broken heart empty state

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  constructor(page: Page, api: ApiHelper) {
    super(page, api);
  }

  async execute() {
    const fav = new FavoritesPage(this.page);
    await fav.open();
    await expect(fav.brokenHeartEmoji).toBeVisible();
    await expect(fav.emptyState).toContainText('is poor since');

    // DB integrity verification — no favorites in DB
    const favs = await this.api.getFavorites();
    expect(favs.status).toBe(200);
    expect(favs.extract('favorites')).toHaveLength(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('REG-4: Empty favorites shows broken heart [Regression]', async ({
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

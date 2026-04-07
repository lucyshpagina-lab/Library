import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { FavoritesPage } from '../../../pages/FavoritesPage';

// Opens favorites page with no favorites and verifies broken heart empty state
class FavP1 extends BaseTest {
  async preconditions() {}
  async test() {
    const fav = new FavoritesPage(this.page);
    await fav.open();
    await expect(fav.brokenHeartEmoji).toBeVisible();
    await expect(fav.emptyState).toContainText('is poor since');
  }
  async postconditions() {}
}

test('FAV-P1: Empty favorites shows broken heart [State Transition]', async ({ authenticatedPage }) => {
  const t = new FavP1(authenticatedPage);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

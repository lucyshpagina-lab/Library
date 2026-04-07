import { test, expect } from '../../../fixtures/test.fixture';
import { FavoritesPage } from '../../../pages/FavoritesPage';

// Opens favorites page with no favorites and verifies broken heart empty state
test('FAV-P1: Empty favorites shows broken heart [State Transition]', async ({ authenticatedPage }) => {
  await test.step('PRECONDITIONS', async () => {
    // User has no favorites - clean state from fixture
  });

  await test.step('TEST', async () => {
    const fav = new FavoritesPage(authenticatedPage);
    await fav.open();
    await expect(fav.brokenHeartEmoji).toBeVisible();
    await expect(fav.emptyState).toContainText('is poor since');
  });
});

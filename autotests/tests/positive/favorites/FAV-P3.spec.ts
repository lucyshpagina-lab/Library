import { test, expect } from '../../../fixtures/test.fixture';
import { FavoritesPage } from '../../../pages/FavoritesPage';

// Adds favorite via API, opens page, verifies heart icon in header is red and filled
test('FAV-P3: Red heart counter in header [State Transition]', async ({ authenticatedPage, bookSetup, favoriteSetup }) => {
  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    await favoriteSetup.addFavorite(book.id, book.title);
  });

  await test.step('TEST', async () => {
    await new FavoritesPage(authenticatedPage).open();
    const heart = authenticatedPage.locator('header a[href="/favorites"] svg');
    await expect(heart).toHaveClass(/fill-red-500/);
  });
});

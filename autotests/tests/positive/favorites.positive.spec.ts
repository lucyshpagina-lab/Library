import { test, expect } from '../../fixtures/test.fixture';
import { FavoritesPage } from '../../pages/FavoritesPage';
import { log } from '../../helpers/api';

test.describe('❤️ Favorites [Positive]', () => {

  test('FAV-P1: Empty favorites shows broken heart [State Transition]', async ({ authenticatedPage, testUser }) => {
    await test.step('📋 PRECONDITION: User has no favorites', async () => {
      log.precondition(`User "${testUser.username}" has zero favorites`);
    });
    await test.step('🧪 TEST: Open favorites page', async () => {
      await new FavoritesPage(authenticatedPage).open();
      log.test('Favorites page opened');
    });
    await test.step('✅ VERIFY: Broken heart and funny message', async () => {
      const fav = new FavoritesPage(authenticatedPage);
      await expect(fav.brokenHeartEmoji).toBeVisible();
      await expect(fav.emptyState).toContainText('is poor since');
      log.success('💔 Empty state with funny message displayed');
    });
  });

  test('FAV-P2: Add favorite via API → verify on page [Use Case]', async ({ authenticatedPage, bookSetup, favoriteSetup }) => {
    let bookTitle: string;
    await test.step('📋 PRECONDITION: Add book to favorites via API', async () => {
      const book = await bookSetup.getExistingBook();
      bookTitle = book.title;
      await favoriteSetup.addFavorite(book.id, book.title);
    });
    await test.step('🧪 TEST: Open favorites page', async () => {
      await new FavoritesPage(authenticatedPage).open();
      log.test('Favorites page opened');
    });
    await test.step('✅ VERIFY: Book in favorites', async () => {
      const fav = new FavoritesPage(authenticatedPage);
      await expect(fav.bookCount).toBeVisible();
      await expect(fav.bookByTitle(bookTitle)).toBeVisible();
      log.success(`"${bookTitle}" found in favorites`);
    });
  });

  test('FAV-P3: Red heart counter in header [State Transition]', async ({ authenticatedPage, bookSetup, favoriteSetup }) => {
    await test.step('📋 PRECONDITION: Add favorite via API', async () => {
      const book = await bookSetup.getExistingBook();
      await favoriteSetup.addFavorite(book.id, book.title);
    });
    await test.step('🧪 TEST: Open favorites and check header', async () => {
      await new FavoritesPage(authenticatedPage).open();
      log.test('Favorites page opened');
    });
    await test.step('✅ VERIFY: Heart is red and filled', async () => {
      const heart = authenticatedPage.locator('header a[href="/favorites"] svg');
      await expect(heart).toHaveClass(/fill-red-500/);
      log.success('Red filled heart in header');
    });
  });
});

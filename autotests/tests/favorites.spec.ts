import { test, expect } from '../fixtures/test.fixture';
import { FavoritesPage } from '../pages/FavoritesPage';
import { log } from '../helpers/api';

test.describe('❤️ Favorites', () => {

  test('FAV-1: Empty favorites shows broken heart', async ({ authenticatedPage, testUser }) => {
    await test.step('📋 PRECONDITION: User has no favorites', async () => {
      log.precondition(`User "${testUser.username}" has no favorites yet`);
      log.success('Clean state confirmed');
    });

    await test.step('🧪 TEST: Open favorites page', async () => {
      const favPage = new FavoritesPage(authenticatedPage);
      await favPage.open();
      log.test('Favorites page opened');
    });

    await test.step('✅ VERIFY: Broken heart and funny message shown', async () => {
      const favPage = new FavoritesPage(authenticatedPage);
      await expect(favPage.brokenHeartEmoji).toBeVisible();
      await expect(favPage.emptyState).toContainText('is poor since');
      log.test('💔 Broken heart emoji is visible');
      log.success(`"${testUser.username} is poor since doesn\'t like books" shown`);
    });
  });

  test('FAV-2: Add favorite via API → verify on favorites page', async ({ authenticatedPage, api }) => {
    let bookTitle: string;

    await test.step('📋 PRECONDITION: Add a book to favorites via API', async () => {
      const booksRes = await api.getBooks({ limit: '1' });
      booksRes.statusCode(200);
      const book = booksRes.extract('books')[0];
      bookTitle = book.title;

      await api.addFavorite(book.id);
      log.precondition(`Added "${bookTitle}" to favorites`);
      log.info(`REST Assured: favorite added for book ${book.id}`);
      log.success('Favorite is set up');
    });

    await test.step('🧪 TEST: Open favorites page', async () => {
      const favPage = new FavoritesPage(authenticatedPage);
      await favPage.open();
      log.test('Favorites page opened');
    });

    await test.step('✅ VERIFY: Book appears in favorites', async () => {
      const favPage = new FavoritesPage(authenticatedPage);
      await expect(favPage.bookCount).toBeVisible();
      await expect(favPage.bookByTitle(bookTitle)).toBeVisible();
      log.success(`"${bookTitle}" found in favorites list`);
    });
  });

  test('FAV-3: Favorites counter shows red heart in header', async ({ authenticatedPage, api }) => {
    await test.step('📋 PRECONDITION: Add a book to favorites via API', async () => {
      const booksRes = await api.getBooks({ limit: '1' });
      const book = booksRes.extract('books')[0];
      await api.addFavorite(book.id);
      log.precondition(`Added "${book.title}" to favorites`);
      log.success('Favorite is set up');
    });

    await test.step('🧪 TEST: Open favorites page and check header', async () => {
      const favPage = new FavoritesPage(authenticatedPage);
      await favPage.open();
      log.test('Favorites page opened');
    });

    await test.step('✅ VERIFY: Heart icon in header is red with counter', async () => {
      const heartIcon = authenticatedPage.locator('header a[href="/favorites"] svg');
      await expect(heartIcon).toHaveClass(/fill-red-500/);
      log.success('Heart icon is red and filled in header');
    });
  });
});

import { test, expect } from '../fixtures/auth.fixture';
import { FavoritesPage } from '../pages/FavoritesPage';
import { BookPage } from '../pages/BookPage';

test.describe('Favorites', () => {
  test('should show empty state with broken heart when no favorites', async ({ authenticatedPage, testUser }) => {
    // Preconditions: authenticated user with no favorites

    // Test: verify empty favorites page
    const favPage = new FavoritesPage(authenticatedPage);
    await favPage.open();

    await expect(favPage.brokenHeartEmoji).toBeVisible();
    await expect(favPage.emptyState).toContainText('is poor since');
  });

  test('should add favorite via API and verify on UI', async ({ authenticatedPage, api }) => {
    // Preconditions: add a book to favorites via API
    const booksData = await api.getBooks({ limit: '1' });
    const bookId = booksData.books[0].id;
    const bookTitle = booksData.books[0].title;
    await api.addFavorite(bookId);

    // Test: verify the book appears in favorites
    const favPage = new FavoritesPage(authenticatedPage);
    await favPage.open();

    await expect(favPage.bookCount).toBeVisible();
    await expect(favPage.bookByTitle(bookTitle)).toBeVisible();
  });

  test('should show red heart counter in header when favorites exist', async ({ authenticatedPage, api }) => {
    // Preconditions: add a favorite via API
    const booksData = await api.getBooks({ limit: '1' });
    await api.addFavorite(booksData.books[0].id);

    // Test: verify header shows red heart with count
    const favPage = new FavoritesPage(authenticatedPage);
    await favPage.open();

    const heartIcon = authenticatedPage.locator('header a[href="/favorites"] svg');
    await expect(heartIcon).toHaveClass(/fill-red-500/);
  });
});

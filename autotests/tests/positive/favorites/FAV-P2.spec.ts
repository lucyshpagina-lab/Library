import { test, expect } from '../../../fixtures/test.fixture';
import { FavoritesPage } from '../../../pages/FavoritesPage';

// Adds book to favorites via API, opens favorites page, verifies book appears
test('FAV-P2: Add favorite via API and verify on page [Use Case]', async ({ authenticatedPage, bookSetup, favoriteSetup }) => {
  let bookTitle: string;

  await test.step('PRECONDITIONS', async () => {
    const book = await bookSetup.getExistingBook();
    bookTitle = book.title;
    await favoriteSetup.addFavorite(book.id, book.title);
  });

  await test.step('TEST', async () => {
    const fav = new FavoritesPage(authenticatedPage);
    await fav.open();
    await expect(fav.bookCount).toBeVisible();
    await expect(fav.bookByTitle(bookTitle)).toBeVisible();
  });
});

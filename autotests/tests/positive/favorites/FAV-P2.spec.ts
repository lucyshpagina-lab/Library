import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { FavoritesPage } from '../../../pages/FavoritesPage';

// Adds book to favorites via API, verifies book appears on favorites page
class FavP2 extends BaseTest {
  private bookTitle!: string;
  async preconditions() {
    const books = await this.api.getBooks({ limit: '1' });
    const book = books.extract('books')[0];
    this.bookTitle = book.title;
    await this.api.addFavorite(book.id);
  }
  async execute() {
    const fav = new FavoritesPage(this.page);
    await fav.open();
    await expect(fav.bookCount).toBeVisible();
    await expect(fav.bookByTitle(this.bookTitle)).toBeVisible();
  }
  async postconditions() {}
}

test('FAV-P2: Add favorite via API and verify on page [Use Case]', async ({ authenticatedPage, api }) => {
  const t = new FavP2(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

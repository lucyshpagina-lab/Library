import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { FavoritesPage } from '../../../pages/FavoritesPage';

// Adds favorite via API, verifies heart icon in header is red and filled
class FavP3 extends BaseTest {
  async preconditions() {
    const books = await this.api.getBooks({ limit: '1' });
    await this.api.addFavorite(books.extract('books')[0].id);
  }
  async test() {
    await new FavoritesPage(this.page).open();
    const heart = this.page.locator('header a[href="/favorites"] svg');
    await expect(heart).toHaveClass(/fill-red-500/);
  }
  async postconditions() {}
}

test('FAV-P3: Red heart counter in header [State Transition]', async ({ authenticatedPage, api }) => {
  const t = new FavP3(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { FavoritesPage } from '../../../pages/FavoritesPage';
import { ApiHelper } from '../../../helpers/api';
import { Page } from '@playwright/test';
// Adds book to favorites via API, verifies book appears on favorites page

class Preconditions extends BasePreconditions {
  bookTitle!: string;
  bookId!: number;

  async setup() {
    const books = await this.api.getBooks({ limit: '1' });
    const book = books.extract('books')[0];
    this.bookTitle = book.title;
    this.bookId = book.id;
    await this.api.addFavorite(book.id);
  }
}

class Test extends BaseTest {
  constructor(
    page: Page,
    private bookTitle: string,
    api: ApiHelper,
  ) {
    super(page, api);
  }

  async execute() {
    const fav = new FavoritesPage(this.page);
    await fav.open();
    await expect(fav.bookCount).toBeVisible();
    await expect(fav.bookByTitle(this.bookTitle)).toBeVisible();

    // DB integrity verification (API) — favorite FK to book
    const favs = await this.api.getFavorites();
    expect(favs.status).toBe(200);
    const favBooks = favs.extract('favorites');
    expect(favBooks.some((f: any) => f.book.title === this.bookTitle)).toBe(true);

    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  constructor(
    api: ApiHelper,
    private bookId: number,
  ) {
    super(api);
  }

  async cleanup() {
    await this.api.removeFavorite(this.bookId);
    await this.api.cleanupAll();
  }
}

test('FAV-P2: Add favorite via API and verify on page [Use Case]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(authenticatedPage, pre.bookTitle, api);
  const post = new Postconditions(api, pre.bookId);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

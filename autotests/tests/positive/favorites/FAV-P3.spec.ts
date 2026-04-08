import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTestAction, BasePostconditions } from '../../../helpers/BaseTest';
import { FavoritesPage } from '../../../pages/FavoritesPage';
import { ApiHelper } from '../../../helpers/api';
// Adds favorite via API, verifies heart icon in header is red and filled

class Preconditions extends BasePreconditions {
  bookId!: number;

  async setup() {
    const books = await this.api.getBooks({ limit: '1' });
    this.bookId = books.extract('books')[0].id;
    await this.api.addFavorite(this.bookId);
  }
}

class TestAction extends BaseTestAction {
  async execute() {
    await new FavoritesPage(this.page).open();
    const heart = this.page.locator('header a[href="/favorites"] svg');
    await expect(heart).toHaveClass(/fill-red-500/);
  }
}

class Postconditions extends BasePostconditions {
  constructor(api: ApiHelper, private bookId: number) { super(api); }

  async cleanup() {
    await this.api.removeFavorite(this.bookId);
    await this.api.cleanupAll();
  }
}

test('FAV-P3: Red heart counter in header [State Transition]', async ({ authenticatedPage, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new TestAction(authenticatedPage);
  const post = new Postconditions(api, pre.bookId);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

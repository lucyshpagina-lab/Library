import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Opens catalog, verifies books load, filters by Fantasy genre and checks results

class Preconditions extends BasePreconditions {
  async setup() {
    // Catalog tests rely on seeded data — no API setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    const catalog = new CatalogPage(this.page);
    await catalog.open();
    await expect(catalog.bookCards.first()).toBeVisible();
    await catalog.filterByGenre('Fantasy');
    await this.page.waitForTimeout(1000);
    await expect(catalog.bookCount).toContainText('50 books found');
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CAT-P1: Display books and filter by genre [Use Case]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(page);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

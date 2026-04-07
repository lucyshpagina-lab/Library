import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Opens catalog, verifies books load, filters by Fantasy genre and checks 10 results
class CatP1 extends BaseTest {
  async preconditions() { await new CatalogPage(this.page).open(); }
  async test() {
    const catalog = new CatalogPage(this.page);
    await expect(catalog.bookCards.first()).toBeVisible();
    await catalog.filterByGenre('Fantasy');
    await this.page.waitForTimeout(1000);
    await expect(catalog.bookCount).toContainText('10 books found');
  }
  async postconditions() {}
}

test('CAT-P1: Display books and filter by genre [Use Case]', async ({ page }) => {
  const t = new CatP1(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

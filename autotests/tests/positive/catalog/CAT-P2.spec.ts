import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Searches for "Dune" in catalog and verifies the book card appears
class CatP2 extends BaseTest {
  async preconditions() {
    const catalog = new CatalogPage(this.page);
    await catalog.open();
    await expect(catalog.bookCards.first()).toBeVisible({ timeout: 10000 });
  }
  async test() {
    const catalog = new CatalogPage(this.page);
    await catalog.searchFor('Dune');
    await this.page.waitForTimeout(1000);
    await expect(catalog.bookCardByTitle('Dune').first()).toBeVisible({ timeout: 10000 });
  }
  async postconditions() {}
}

test('CAT-P2: Search books by title [Use Case]', async ({ page }) => {
  const t = new CatP2(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Changes sort to Author A-Z and verifies books reload
class CatP3 extends BaseTest {
  async preconditions() { await new CatalogPage(this.page).open(); }
  async test() {
    const catalog = new CatalogPage(this.page);
    await catalog.selectSort('author');
    await this.page.waitForTimeout(1000);
    await expect(catalog.bookCards.first()).toBeVisible();
  }
  async postconditions() {}
}

test('CAT-P3: Sort books by author A-Z [EP: valid sort]', async ({ page }) => {
  const t = new CatP3(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

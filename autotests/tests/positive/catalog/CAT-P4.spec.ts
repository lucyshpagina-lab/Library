import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Opens catalog and verifies the sort dropdown defaults to Newest
class CatP4 extends BaseTest {
  async preconditions() { await new CatalogPage(this.page).open(); }
  async test() { await expect(new CatalogPage(this.page).sortSelect).toHaveValue('date'); }
  async postconditions() {}
}

test('CAT-P4: Default sort is Newest [State Transition]', async ({ page }) => {
  const t = new CatP4(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

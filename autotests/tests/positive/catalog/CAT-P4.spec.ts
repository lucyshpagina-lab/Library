import { test, expect } from '../../../fixtures/test.fixture';
import { CatalogPage } from '../../../pages/CatalogPage';

// Opens catalog and verifies the sort dropdown defaults to Newest
test('CAT-P4: Default sort is Newest [State Transition]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new CatalogPage(page).open();
  });

  await test.step('TEST', async () => {
    await expect(new CatalogPage(page).sortSelect).toHaveValue('date');
  });
});

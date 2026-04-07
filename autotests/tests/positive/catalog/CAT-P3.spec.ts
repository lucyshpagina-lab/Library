import { test, expect } from '../../../fixtures/test.fixture';
import { CatalogPage } from '../../../pages/CatalogPage';

// Changes sort to Author A-Z and verifies books reload
test('CAT-P3: Sort books by author A-Z [EP: valid sort]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new CatalogPage(page).open();
  });

  await test.step('TEST', async () => {
    const catalog = new CatalogPage(page);
    await catalog.selectSort('author');
    await page.waitForTimeout(1000);
    await expect(catalog.bookCards.first()).toBeVisible();
  });
});

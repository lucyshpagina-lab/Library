import { test, expect } from '../../../fixtures/test.fixture';
import { CatalogPage } from '../../../pages/CatalogPage';

// Searches for "Dune" in catalog and verifies the book card appears
test('CAT-P2: Search books by title [Use Case]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    const catalog = new CatalogPage(page);
    await catalog.open();
    await expect(catalog.bookCards.first()).toBeVisible({ timeout: 10000 });
  });

  await test.step('TEST', async () => {
    const catalog = new CatalogPage(page);
    await catalog.searchFor('Dune');
    await page.waitForTimeout(1000);
    await expect(catalog.bookCardByTitle('Dune').first()).toBeVisible({ timeout: 10000 });
  });
});

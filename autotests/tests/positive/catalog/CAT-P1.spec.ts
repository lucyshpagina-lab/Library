import { test, expect } from '../../../fixtures/test.fixture';
import { CatalogPage } from '../../../pages/CatalogPage';

// Opens catalog, verifies books load, filters by Fantasy genre and checks 10 results
test('CAT-P1: Display books and filter by genre [Use Case]', async ({ page }) => {
  await test.step('PRECONDITIONS', async () => {
    await new CatalogPage(page).open();
  });

  await test.step('TEST', async () => {
    const catalog = new CatalogPage(page);
    await expect(catalog.bookCards.first()).toBeVisible();
    await catalog.filterByGenre('Fantasy');
    await page.waitForTimeout(1000);
    await expect(catalog.bookCount).toContainText('10 books found');
  });
});

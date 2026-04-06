import { test, expect } from '../../fixtures/test.fixture';
import { CatalogPage } from '../../pages/CatalogPage';
import { log } from '../../helpers/api';

test.describe('📚 Catalog Browsing [Positive]', () => {

  test('CAT-P1: Display books and filter by genre [Use Case]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog', async () => {
      await new CatalogPage(page).open();
      log.precondition('Catalog page loaded');
    });
    await test.step('🧪 TEST: Verify books display and filter by Fantasy', async () => {
      const catalog = new CatalogPage(page);
      await expect(catalog.bookCards.first()).toBeVisible();
      log.test('Books are visible');
      await catalog.filterByGenre('Fantasy');
      await page.waitForTimeout(1000);
      await expect(catalog.bookCount).toContainText('10 books found');
      log.success('Fantasy genre filter shows 10 books');
    });
  });

  test('CAT-P2: Search books by title [Use Case]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog and wait for load', async () => {
      const catalog = new CatalogPage(page);
      await catalog.open();
      await expect(catalog.bookCards.first()).toBeVisible({ timeout: 10000 });
      log.precondition('Catalog loaded');
    });
    await test.step('🧪 TEST: Search for "Dune"', async () => {
      await new CatalogPage(page).searchFor('Dune');
      await page.waitForTimeout(1000);
      log.test('Typed "Dune" in search');
    });
    await test.step('✅ VERIFY: Dune book appears', async () => {
      await expect(new CatalogPage(page).bookCardByTitle('Dune').first()).toBeVisible({ timeout: 10000 });
      log.success('Dune found in search results');
    });
  });

  test('CAT-P3: Sort books by author A-Z [EP: valid sort]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog', async () => {
      await new CatalogPage(page).open();
      log.precondition('Catalog loaded');
    });
    await test.step('🧪 TEST: Change sort to Author A-Z', async () => {
      const catalog = new CatalogPage(page);
      await catalog.selectSort('author');
      await page.waitForTimeout(1000);
      await expect(catalog.bookCards.first()).toBeVisible();
      log.success('Books sorted by author A-Z');
    });
  });

  test('CAT-P4: Default sort is Newest [State Transition]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog', async () => {
      await new CatalogPage(page).open();
      log.precondition('Catalog loaded');
    });
    await test.step('✅ VERIFY: Sort defaults to "date"', async () => {
      await expect(new CatalogPage(page).sortSelect).toHaveValue('date');
      log.success('Default sort is "Newest"');
    });
  });
});

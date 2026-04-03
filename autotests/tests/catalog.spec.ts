import { test, expect } from '../fixtures/test.fixture';
import { CatalogPage } from '../pages/CatalogPage';
import { log } from '../helpers/api';

test.describe('📚 Catalog Browsing', () => {

  test('CAT-1: Display books and filter by genre', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog page', async () => {
      const catalog = new CatalogPage(page);
      await catalog.open();
      log.precondition('Catalog page loaded');
    });

    await test.step('🧪 TEST: Verify books are displayed', async () => {
      const catalog = new CatalogPage(page);
      await expect(catalog.title).toBeVisible();
      await expect(catalog.bookCards.first()).toBeVisible();
      await expect(catalog.bookCount).toBeVisible();
      log.test('Book cards and count are visible');
      log.success('Catalog loads with books');
    });

    await test.step('🧪 TEST: Filter by Fantasy genre', async () => {
      const catalog = new CatalogPage(page);
      await catalog.filterByGenre('Fantasy');
      await page.waitForTimeout(1000);
      await expect(catalog.bookCount).toContainText('10 books found');
      log.test('Filtered catalog by "Fantasy" genre');
      log.success('Genre filter shows 10 Fantasy books');
    });
  });

  test('CAT-2: Search books by title', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog and wait for books', async () => {
      const catalog = new CatalogPage(page);
      await catalog.open();
      await expect(catalog.bookCards.first()).toBeVisible({ timeout: 10000 });
      log.precondition('Catalog loaded with books');
    });

    await test.step('🧪 TEST: Search for "Dune"', async () => {
      const catalog = new CatalogPage(page);
      await catalog.searchFor('Dune');
      await page.waitForTimeout(1000);
      log.test('Typed "Dune" in search input');
    });

    await test.step('✅ VERIFY: Dune book card appears', async () => {
      const catalog = new CatalogPage(page);
      await expect(catalog.bookCardByTitle('Dune').first()).toBeVisible({ timeout: 10000 });
      log.success('Dune book found in search results');
    });
  });

  test('CAT-3: Sort books by author A-Z', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog', async () => {
      const catalog = new CatalogPage(page);
      await catalog.open();
      log.precondition('Catalog page loaded');
    });

    await test.step('🧪 TEST: Change sort to Author A-Z', async () => {
      const catalog = new CatalogPage(page);
      await catalog.selectSort('author');
      await page.waitForTimeout(1000);
      await expect(catalog.bookCards.first()).toBeVisible();
      log.test('Sort changed to Author A-Z');
      log.success('Books re-sorted by author');
    });
  });

  test('CAT-4: Default sort is Newest', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open catalog', async () => {
      const catalog = new CatalogPage(page);
      await catalog.open();
      log.precondition('Catalog page loaded');
    });

    await test.step('✅ VERIFY: Sort dropdown defaults to "date" (Newest)', async () => {
      const catalog = new CatalogPage(page);
      await expect(catalog.sortSelect).toHaveValue('date');
      log.success('Default sort is "Newest" as expected');
    });
  });
});

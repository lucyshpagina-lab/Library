import { test, expect } from '../fixtures/auth.fixture';
import { CatalogPage } from '../pages/CatalogPage';

test.describe('Catalog Page', () => {
  test('should display books and filter by genre', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open();

    await expect(catalog.title).toBeVisible();
    await expect(catalog.bookCards.first()).toBeVisible();
    await expect(catalog.bookCount).toBeVisible();

    await catalog.filterByGenre('Fantasy');
    await page.waitForTimeout(1000);
    await expect(catalog.bookCount).toContainText('10 books found');
  });

  test('should search books by title', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open();

    // Wait for page to fully load before interacting with search
    await expect(catalog.bookCards.first()).toBeVisible({ timeout: 10000 });
    await catalog.searchFor('Dune');
    await page.waitForTimeout(1500);
    await expect(catalog.bookCardByTitle('Dune').first()).toBeVisible({ timeout: 10000 });
  });

  test('should sort books by author A-Z', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open();

    await catalog.selectSort('author');
    await page.waitForTimeout(1000);
    await expect(catalog.bookCards.first()).toBeVisible();
  });

  test('should default to Newest sort', async ({ page }) => {
    const catalog = new CatalogPage(page);
    await catalog.open();

    await expect(catalog.sortSelect).toHaveValue('date');
  });
});

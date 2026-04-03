import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  constructor(page: Page) { super(page); }
  async open() { await this.navigate('/catalog'); }

  get title() { return this.page.getByRole('heading', { name: 'Book Catalog' }); }
  get searchInput() { return this.page.locator('input[placeholder*="Search"]').first(); }
  get sortSelect() { return this.page.getByLabel('Sort books'); }
  get bookCards() { return this.page.locator('a[href^="/book/"]'); }
  get bookCount() { return this.page.locator('text=/\\d+ books? found/'); }

  genreButton(genre: string) { return this.page.getByRole('button', { name: genre, exact: true }); }
  bookCardByTitle(title: string) { return this.page.locator('a[href^="/book/"]', { hasText: title }); }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(600);
  }
  async selectSort(value: string) { await this.sortSelect.selectOption(value); }
  async filterByGenre(genre: string) { await this.genreButton(genre).click(); }
}

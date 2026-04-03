import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.navigate('/');
  }

  get heroTitle() {
    return this.page.getByRole('heading', { name: 'Discover Your Next Book' });
  }

  get searchInput() {
    return this.page.getByPlaceholder('Search by title or author...');
  }

  get searchButton() {
    return this.page.getByRole('button', { name: 'Search' });
  }

  get newArrivalsSection() {
    return this.page.getByRole('heading', { name: 'New Arrivals' });
  }

  get popularBooksSection() {
    return this.page.getByRole('heading', { name: 'Popular Books' });
  }

  get bookCards() {
    return this.page.locator('a[href^="/book/"]');
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }
}

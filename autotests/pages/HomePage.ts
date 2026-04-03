import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) { super(page); }
  async open() { await this.navigate('/'); }
  get heroTitle() { return this.page.getByRole('heading', { name: 'Discover Your Next Book' }); }
  get bookCards() { return this.page.locator('a[href^="/book/"]'); }
}

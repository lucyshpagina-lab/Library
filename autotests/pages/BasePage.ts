import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string) {
    await this.page.goto(path);
  }

  async getToastMessage(): Promise<string> {
    const toast = this.page.locator('[role="status"]').first();
    await toast.waitFor({ timeout: 5000 });
    return toast.innerText();
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  get header() {
    return this.page.locator('header');
  }

  get catalogLink() {
    return this.header.getByRole('link', { name: 'Catalog' });
  }

  get favoritesLink() {
    return this.header.locator('a[href="/favorites"]');
  }

  get addBookLink() {
    return this.header.getByRole('link', { name: '+ Add Book' });
  }
}

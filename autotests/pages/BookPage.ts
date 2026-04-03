import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BookPage extends BasePage {
  constructor(page: Page) { super(page); }
  async open(bookId: number) { await this.navigate(`/book/${bookId}`); }

  get title() { return this.page.locator('h1').first(); }
  get readButton() { return this.page.getByRole('button', { name: 'Read Book' }); }
  get deleteButton() { return this.page.locator('button:has(svg.lucide-trash-2)', { hasText: 'Delete' }); }
  get favoriteButton() { return this.page.getByRole('button', { name: /Favorites|Save/ }); }
  get comments() { return this.page.locator('#comments-section'); }
  get booksByAuthorAction() { return this.page.locator('button', { hasText: /Books by/ }); }

  async deleteBook() {
    this.page.on('dialog', (d) => d.accept());
    await this.deleteButton.click();
  }
}

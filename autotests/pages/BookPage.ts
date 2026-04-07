import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BookPage extends BasePage {
  constructor(page: Page) { super(page); }
  async open(bookId: number) { await this.navigate(`/book/${bookId}`); }

  get title() { return this.page.locator('h1').first(); }
  get readButton() { return this.page.getByRole('button', { name: 'Read Book' }); }
  get deleteButton() { return this.page.getByRole('button', { name: /🗑️.*Delete/ }); }
  get favoriteButton() { return this.page.getByRole('button', { name: /Favorites|Save/ }); }
  get comments() { return this.page.locator('#comments-section'); }
  get booksByAuthorAction() { return this.page.locator('button', { hasText: /Books by/ }); }
  get deleteModalConfirm() { return this.page.getByRole('button', { name: /Delete forever/ }); }

  async deleteBook() {
    await this.deleteButton.click();
    await this.deleteModalConfirm.click();
  }
}

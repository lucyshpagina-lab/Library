import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BookPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(bookId: number) {
    await this.navigate(`/book/${bookId}`);
  }

  get title() {
    return this.page.locator('h1').first();
  }

  get author() {
    return this.page.locator('h1 + p').first();
  }

  get genre() {
    return this.page.locator('[class*="badge"], [class*="Badge"]').first();
  }

  get description() {
    return this.page.locator('p.leading-relaxed').first();
  }

  get readButton() {
    return this.page.getByRole('button', { name: 'Read Book' });
  }

  get deleteButton() {
    return this.page.locator('button:has(svg.lucide-trash-2)', { hasText: 'Delete' });
  }

  get favoriteButton() {
    return this.page.getByRole('button', { name: /Favorites|Save/ });
  }

  get ratingStars() {
    return this.page.locator('text=Your rating:').locator('..');
  }

  get commentInput() {
    return this.page.getByPlaceholder(/comment|thought/i);
  }

  get commentSubmit() {
    return this.page.getByRole('button', { name: /post|submit/i });
  }

  get comments() {
    return this.page.locator('#comments-section');
  }

  get readBookAction() {
    return this.page.locator('button', { hasText: /Read \u00ab/ });
  }

  get booksByAuthorAction() {
    return this.page.locator('button', { hasText: /Books by/ });
  }

  async addComment(text: string) {
    await this.commentInput.fill(text);
    await this.commentSubmit.click();
  }

  async deleteBook() {
    this.page.on('dialog', (dialog) => dialog.accept());
    await this.deleteButton.click();
  }
}

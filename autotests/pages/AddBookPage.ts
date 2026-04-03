import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddBookPage extends BasePage {
  constructor(page: Page) { super(page); }
  async open() { await this.navigate('/add-book'); }

  get titleInput() { return this.page.getByLabel('Title'); }
  get authorInput() { return this.page.getByLabel('Author'); }
  get genreSelect() { return this.page.locator('select#genre'); }
  get contentInput() { return this.page.locator('textarea#content'); }
  get descriptionInput() { return this.page.locator('textarea#description'); }
  get pageCountInput() { return this.page.getByLabel('Page Count'); }
  get submitButton() { return this.page.getByRole('button', { name: 'Add Book' }); }

  async fillBook(data: { title: string; author: string; genre: string; content: string; description?: string; pageCount?: number }) {
    await this.titleInput.fill(data.title);
    await this.authorInput.fill(data.author);
    await this.genreSelect.selectOption(data.genre);
    if (data.description) await this.descriptionInput.fill(data.description);
    await this.contentInput.fill(data.content);
    if (data.pageCount) await this.pageCountInput.fill(String(data.pageCount));
  }

  async submit() { await this.submitButton.click(); }
}

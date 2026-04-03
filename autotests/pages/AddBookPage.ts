import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddBookPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.navigate('/add-book');
  }

  get titleInput() {
    return this.page.getByLabel('Title');
  }

  get authorInput() {
    return this.page.getByLabel('Author');
  }

  get genreSelect() {
    return this.page.locator('select#genre');
  }

  get descriptionInput() {
    return this.page.locator('textarea#description');
  }

  get contentInput() {
    return this.page.locator('textarea#content');
  }

  get pageCountInput() {
    return this.page.getByLabel('Page Count');
  }

  get publishedYearInput() {
    return this.page.getByLabel('Published Year');
  }

  get coverUrlInput() {
    return this.page.getByLabel('Cover Image URL');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Add Book' });
  }

  get errorMessage() {
    return this.page.locator('.bg-red-50');
  }

  async fillBook(data: {
    title: string;
    author: string;
    genre: string;
    content: string;
    description?: string;
    pageCount?: number;
    publishedYear?: number;
  }) {
    await this.titleInput.fill(data.title);
    await this.authorInput.fill(data.author);
    await this.genreSelect.selectOption(data.genre);
    if (data.description) await this.descriptionInput.fill(data.description);
    await this.contentInput.fill(data.content);
    if (data.pageCount) await this.pageCountInput.fill(String(data.pageCount));
    if (data.publishedYear) await this.publishedYearInput.fill(String(data.publishedYear));
  }

  async submit() {
    await this.submitButton.click();
  }
}

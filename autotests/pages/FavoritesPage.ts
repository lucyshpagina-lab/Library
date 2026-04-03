import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FavoritesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.navigate('/favorites');
  }

  get title() {
    return this.page.getByRole('heading', { name: 'My Favorites' });
  }

  get emptyState() {
    return this.page.locator('text=is poor since');
  }

  get brokenHeartEmoji() {
    return this.page.locator('text=💔');
  }

  get bookCards() {
    return this.page.locator('a[href^="/book/"]');
  }

  get bookCount() {
    return this.page.locator('text=/\\d+ books? saved/');
  }

  bookByTitle(title: string) {
    return this.page.locator('a[href^="/book/"]', { hasText: title });
  }

  removeButton(title: string) {
    return this.page.getByLabel(`Remove ${title} from favorites`);
  }
}

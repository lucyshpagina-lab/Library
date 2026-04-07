import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { BookPage } from '../../../pages/BookPage';
import { ApiHelper } from '../../../helpers/api';

// Clicks Read Book button and verifies reader opens
class IntP3 extends BaseTest {
  private bookId!: number;
  async preconditions() {
    const api = new ApiHelper();
    this.bookId = (await api.getBooks({ limit: '1' })).extract('books')[0].id;
  }
  async execute() {
    await new BookPage(this.page).open(this.bookId);
    await new BookPage(this.page).readButton.click();
    await this.page.waitForURL('/read/' + this.bookId);
    await expect(this.page.locator('article')).toBeVisible();
  }
  async postconditions() {}
}

test('INT-P3: Navigate to reader from book detail [Use Case]', async ({ page }) => {
  const t = new IntP3(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

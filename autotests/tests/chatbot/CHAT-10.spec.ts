import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Remove book from favorites via chat (precondition: add favorite first)

class Preconditions extends BasePreconditions {
  async setup() {
    const books = await this.api.getBooks({ search: 'Dune' });
    const bookId = books.extract('books')[0]?.id;
    if (bookId) await this.api.addFavorite(bookId);
  }
}

class Test extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('remove from favorites Dune');
    await this.page.locator('[data-testid="chat-send"]').click();

    const messages = this.page.locator('[data-testid="chat-messages"]');
    await expect(messages).toContainText('Removed', { timeout: 5000 });
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-10: Remove book from favorites via chat [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage, api);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Add book to favorites via chat

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('add to favorites Dune');
    await this.page.locator('[data-testid="chat-send"]').click();

    const messages = this.page.locator('[data-testid="chat-messages"]');
    await expect(messages).toContainText('Added', { timeout: 5000 });
    await expect(this.page.locator('[data-testid="chat-book-card"]').first()).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-9: Add book to favorites via chat [Functional]', async ({ authenticatedPage, api }) => {
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

import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Ask "How do I download a book?" gives correct response

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('How do I download a book?');
    await this.page.locator('[data-testid="chat-send"]').click();

    const messages = this.page.locator('[data-testid="chat-messages"]');
    await expect(messages).toContainText('Read Book', { timeout: 5000 });
    await expect(this.page.locator('[data-testid="chat-action"]').first()).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-6: FAQ "How to download" gives step-by-step answer [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new Preconditions(api);
  const action = new Test(authenticatedPage);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

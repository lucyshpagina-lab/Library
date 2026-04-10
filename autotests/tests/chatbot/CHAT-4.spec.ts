import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Recommendations based on genre preference

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('recommend fantasy books');
    await this.page.locator('[data-testid="chat-send"]').click();

    await expect(this.page.locator('[data-testid="chat-book-card"]').first()).toBeVisible({
      timeout: 5000,
    });
    const cards = this.page.locator('[data-testid="chat-book-card"]');
    expect(await cards.count()).toBeGreaterThan(0);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-4: Recommendations by genre show suitable books [Functional]', async ({
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

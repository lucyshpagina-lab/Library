import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Quick reply buttons work

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();

    const helpBtn = this.page.locator('[data-testid="chat-action"]').filter({ hasText: 'Help' });
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();

    await expect(this.page.locator('[data-testid="chat-messages"]')).toContainText(
      'what I can help',
      { timeout: 5000 },
    );
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-14: Quick reply buttons send messages [UI/UX]', async ({ authenticatedPage, api }) => {
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

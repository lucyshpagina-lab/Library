import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Chat widget opens/closes on all pages

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    // Test on home page
    await this.page.goto('/');
    const toggle = this.page.locator('[data-testid="chat-toggle"]');
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(this.page.locator('[data-testid="chat-window"]')).toBeVisible();
    await expect(this.page.locator('[data-testid="chat-input"]')).toBeVisible();

    await toggle.click();
    await expect(this.page.locator('[data-testid="chat-window"]')).not.toBeVisible();

    // Test on catalog page
    await this.page.goto('/catalog');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(this.page.locator('[data-testid="chat-window"]')).toBeVisible();
    await toggle.click();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-12: Chat widget opens and closes on multiple pages [UI/UX]', async ({
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

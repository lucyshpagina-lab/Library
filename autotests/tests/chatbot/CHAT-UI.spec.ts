import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Chatbot UI/UX tests

class NoopPre extends BasePreconditions {
  async setup() {}
}
class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

// ── #11: Chat widget opens/closes on all pages ──

class WidgetToggle extends BaseTest {
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

// ── #12: Welcome message appears on open ──

class WelcomeMessage extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();

    const messages = this.page.locator('[data-testid="chat-messages"]');
    await expect(messages).toContainText('Library Assistant');
    await expect(this.page.locator('[data-testid="chat-action"]').first()).toBeVisible();
  }
}

// ── Quick reply buttons work ──

class QuickReplyWorks extends BaseTest {
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

// ── Test calls ──

test('CHAT-12: Chat widget opens and closes on multiple pages [UI/UX]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new WidgetToggle(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-13: Welcome message with quick actions shows on open [UI/UX]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new WelcomeMessage(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-14: Quick reply buttons send messages [UI/UX]', async ({ authenticatedPage, api }) => {
  const pre = new NoopPre(api);
  const action = new QuickReplyWorks(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

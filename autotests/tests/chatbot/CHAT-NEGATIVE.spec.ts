import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Chatbot negative scenario tests

class NoopPre extends BasePreconditions {
  async setup() {}
}
class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

// ── #15: Empty message — send button disabled ──

class EmptyMessage extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();

    const sendBtn = this.page.locator('[data-testid="chat-send"]');
    await expect(sendBtn).toBeDisabled();

    // Type spaces only
    await this.page.locator('[data-testid="chat-input"]').fill('   ');
    await expect(sendBtn).toBeDisabled();
  }
}

// ── #16: Very long message handled correctly ──

class LongMessage extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('a'.repeat(500));
    await this.page.locator('[data-testid="chat-send"]').click();

    // Bot should respond (not crash), even if it doesn't understand
    await expect(this.page.locator('[data-testid="chat-messages"]')).toContainText(
      'not sure I understand',
      { timeout: 5000 },
    );
  }
}

// ── #14: Response time check — should be < 3 seconds ──

class ResponseTime extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();

    const start = Date.now();
    await this.page.locator('[data-testid="chat-input"]').fill('hello');
    await this.page.locator('[data-testid="chat-send"]').click();

    // Wait for bot response (typing indicator disappears)
    await expect(this.page.locator('[data-testid="chat-typing"]')).not.toBeVisible({
      timeout: 3000,
    });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  }
}

// ── Test calls ──

test('CHAT-15: Empty or whitespace message keeps send disabled [Negative]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new EmptyMessage(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-16: Very long message does not crash bot [Negative]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new LongMessage(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-17: Bot response time is under 3 seconds [Performance]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new ResponseTime(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

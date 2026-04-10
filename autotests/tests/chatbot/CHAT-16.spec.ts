import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Very long message handled correctly

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
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

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-16: Very long message does not crash bot [Negative]', async ({
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

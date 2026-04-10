import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Response time check — should be < 3 seconds

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
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

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-17: Bot response time is under 3 seconds [Performance]', async ({
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

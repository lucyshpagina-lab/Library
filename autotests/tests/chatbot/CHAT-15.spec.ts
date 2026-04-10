import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Empty message — send button disabled

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
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

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-15: Empty or whitespace message keeps send disabled [Negative]', async ({
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

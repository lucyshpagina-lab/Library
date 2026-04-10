import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Link navigation from bot messages — register FAQ shows Sign Up action

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('how to register');
    await this.page.locator('[data-testid="chat-send"]').click();

    await expect(this.page.locator('[data-testid="chat-messages"]')).toContainText('Sign Up', {
      timeout: 5000,
    });
    const signUpAction = this.page
      .locator('[data-testid="chat-action"]')
      .filter({ hasText: 'Sign Up' });
    await expect(signUpAction).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CHAT-8: Register FAQ shows clickable Sign Up action [Functional]', async ({
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

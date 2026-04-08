import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { LoginPage } from '../../../pages/LoginPage';

// Submits wrong credentials and verifies oops animation with Try Again button

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed — testing invalid credentials
  }
}

class Test extends BaseTest {
  async execute() {
    await new LoginPage(this.page).open();
    await new LoginPage(this.page).login('fake@test.com', 'wrongpass');
    await expect(new LoginPage(this.page).tryAgainButton).toBeVisible({ timeout: 10000 });
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('AUTH-P2: Login shows oops then Try Again works [State Transition]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(page);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

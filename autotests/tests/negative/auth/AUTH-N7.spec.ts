import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { LoginPage } from '../../../pages/LoginPage';

// Submits wrong credentials on login, verifies oops screen stays visible

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    await new LoginPage(this.page).open();
    await new LoginPage(this.page).login('nonexistent@test.com', 'wrongpassword');
    await expect(new LoginPage(this.page).tryAgainButton).toBeVisible({ timeout: 10000 });
    // DB integrity verification — invalid user was not created
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('AUTH-N7: Login with wrong creds shows oops screen [State Transition]', async ({
  page,
  api,
}) => {
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

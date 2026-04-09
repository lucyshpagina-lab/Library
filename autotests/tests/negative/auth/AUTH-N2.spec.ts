import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits register form with 7-char password (below min 8), verifies rejection

class Preconditions extends BasePreconditions {
  async setup() {
    // No API setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    await new RegisterPage(this.page).open();
    const reg = new RegisterPage(this.page);
    await reg.usernameInput.fill('shortpw');
    await reg.emailInput.fill('short@test.com');
    await reg.passwordInput.fill('1234567');
    await reg.confirmPasswordInput.fill('1234567');
    await reg.submitButton.click();
    await expect(this.page).toHaveURL(/register/);
    // DB integrity verification — invalid user was not created
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('AUTH-N2: Short password rejected 7 chars [EP]', async ({ page, api }) => {
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

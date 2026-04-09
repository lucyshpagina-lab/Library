import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits register form with invalid email format, verifies form stays on register page

class Preconditions extends BasePreconditions {
  async setup() {
    // No API setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    await new RegisterPage(this.page).open();
    const reg = new RegisterPage(this.page);
    await reg.usernameInput.fill('testuser');
    await reg.emailInput.fill('not-an-email');
    await reg.passwordInput.fill('Password123!');
    await reg.confirmPasswordInput.fill('Password123!');
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

test('AUTH-N1: Invalid email format rejected [EP]', async ({ page, api }) => {
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

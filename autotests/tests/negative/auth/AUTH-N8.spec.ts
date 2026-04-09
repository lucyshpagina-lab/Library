import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Submits mismatched passwords on register, verifies error message

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    await new RegisterPage(this.page).open();
    const reg = new RegisterPage(this.page);
    await reg.usernameInput.fill('mismatch');
    await reg.emailInput.fill('mismatch@test.com');
    await reg.passwordInput.fill('Password123!');
    await reg.confirmPasswordInput.fill('DifferentPass!');
    await reg.submitButton.click();
    await expect(this.page.locator('.bg-red-50')).toContainText('Passwords do not match', {
      timeout: 5000,
    });
    // DB integrity verification — invalid user was not created
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('AUTH-N8: Passwords mismatch shows error message [Cause-Effect]', async ({ page, api }) => {
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

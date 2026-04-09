import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { LoginPage } from '../../../pages/LoginPage';

// Injects SQL payload in login email, verifies login fails safely

class Preconditions extends BasePreconditions {
  async setup() {
    // No API setup needed — testing against login form
  }
}

class Test extends BaseTest {
  async execute() {
    await new LoginPage(this.page).open();
    await new LoginPage(this.page).login("' OR 1=1 --", 'password');
    await expect(new LoginPage(this.page).tryAgainButton.or(this.page.locator('form'))).toBeVisible(
      { timeout: 10000 },
    );

    // DB integrity verification — SQL injection did not create/modify records
    const sqlUser = await this.db.findUserByEmail("' OR 1=1 --");
    expect(sqlUser).toBeNull();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('AUTH-S1: SQL injection in login email [SQL Injection]', async ({ page, api }) => {
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

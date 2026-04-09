import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { RegisterPage } from '../../pages/RegisterPage';
import { HomePage } from '../../pages/HomePage';

// Regression: Register new user via UI and verify redirect to home page

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  private id = Date.now();

  async execute() {
    await new RegisterPage(this.page).open();
    await new RegisterPage(this.page).register(
      `user${this.id}`,
      `user-${this.id}@test.com`,
      'Password123!',
    );
    await this.page.waitForURL('/', { timeout: 10000 });
    await expect(new HomePage(this.page).heroTitle).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('REG-1: Register new user via UI [Regression]', async ({ page, api }) => {
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

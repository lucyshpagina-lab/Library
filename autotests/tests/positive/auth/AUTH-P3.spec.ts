import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { RegisterPage } from '../../../pages/RegisterPage';

// Registers with 3-char username (exact minimum boundary) and verifies success

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed — registration is the test itself
  }
}

class Test extends BaseTest {
  private id = Date.now();

  async execute() {
    await new RegisterPage(this.page).open();
    await new RegisterPage(this.page).register(
      `a${String(this.id).slice(-2)}`,
      `bva-${this.id}@test.com`,
      'Password123!',
    );
    await this.page.waitForURL('/', { timeout: 10000 });
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('AUTH-P3: Register with exact boundary username 3 chars [BVA]', async ({ page, api }) => {
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

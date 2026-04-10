import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { ApiHelper } from '../../helpers/api';

// XSS username does not persist as executable in database

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    await api.register(
      `xss-db-${Date.now()}@test.com`,
      '<script>alert("xss")</script>',
      'Password123!',
    );
    const xssUser = await this.db.findUserByUsername('<script>alert("xss")</script>');
    expect(xssUser).toBeNull();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('DB-SEC-2: XSS username not stored in database [DB]', async ({ page, api }) => {
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

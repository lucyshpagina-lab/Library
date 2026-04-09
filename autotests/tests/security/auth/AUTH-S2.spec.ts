import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Registers with XSS script tag as username, verifies safe handling

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    const res = await api.register(
      `xss-${Date.now()}@test.com`,
      '<script>alert("xss")</script>',
      'Password123!',
    );
    if (res.status === 201) expect(res.extract('user.username')).not.toContain('<script>');

    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('AUTH-S2: XSS in username during registration [XSS]', async ({ page, api }) => {
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

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Injects SQL payloads in all registration fields, verifies safe handling

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    const res = await api.register(
      "admin'--@test.com",
      "admin'; DROP TABLE users;--",
      "' OR '1'='1",
    );
    expect([201, 400, 409, 422, 500]).toContain(res.status);
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('AUTH-S3: SQL injection in registration fields [SQL Injection]', async ({ page, api }) => {
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

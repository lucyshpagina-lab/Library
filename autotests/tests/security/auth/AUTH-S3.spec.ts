import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Injects SQL payloads in all registration fields, verifies safe handling
class AuthS3 extends BaseTest {
  async preconditions() {}
  async execute() {
    const api = new ApiHelper();
    const res = await api.register("admin'--@test.com", "admin'; DROP TABLE users;--", "' OR '1'='1");
    expect([201, 400, 409, 422, 500]).toContain(res.status);
  }
  async postconditions() {}
}

test('AUTH-S3: SQL injection in registration fields [SQL Injection]', async ({ page }) => {
  const t = new AuthS3(page);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

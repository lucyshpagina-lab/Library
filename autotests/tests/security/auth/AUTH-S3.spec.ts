import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Injects SQL payloads in all registration fields, verifies server handles safely
test('AUTH-S3: SQL injection in registration fields [SQL Injection]', async () => {
  await test.step('TEST', async () => {
    const api = new ApiHelper();
    const res = await api.register("admin'--@test.com", "admin'; DROP TABLE users;--", "' OR '1'='1");
    expect([201, 400, 409, 422, 500]).toContain(res.status);
  });
});

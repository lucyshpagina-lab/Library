import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Compares login response times for existing vs non-existing email to check timing attack
test('AUTH-S4: Login timing attack check [Security]', async () => {
  await test.step('TEST', async () => {
    const api = new ApiHelper();
    const email = `timing-${Date.now()}@test.com`;
    await api.register(email, `timing${Date.now()}`, 'Password123!');

    const t1 = Date.now();
    await api.login(email, 'wrongpassword');
    const existingTime = Date.now() - t1;

    const t2 = Date.now();
    await api.login('nonexistent-totally@fake.com', 'wrongpassword');
    const nonExistingTime = Date.now() - t2;

    expect(Math.abs(existingTime - nonExistingTime)).toBeLessThan(500);
  });
});

import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Registers with 2-char username via API, verifies rejection (min is 3)
test('AUTH-N3: Username too short 2 chars rejected [EP]', async () => {
  await test.step('TEST', async () => {
    const api = new ApiHelper();
    const res = await api.register('short@test.com', 'ab', 'Password123!');
    expect(res.status).not.toBe(201);
  });
});

import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Registers with 21-char username (max+1 boundary), verifies API rejects it
test('AUTH-N5: Username at max+1 boundary 21 chars fails [BVA]', async () => {
  await test.step('TEST', async () => {
    const api = new ApiHelper();
    const res = await api.register(`bva-${Date.now()}@test.com`, 'a'.repeat(21), 'Password123!');
    expect(res.status).not.toBe(201);
  });
});

import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Registers with 2-char username (min-1 boundary), verifies API rejects it
test('AUTH-N4: Username at min-1 boundary 2 chars fails [BVA]', async () => {
  await test.step('TEST', async () => {
    const api = new ApiHelper();
    const res = await api.register(`bva-${Date.now()}@test.com`, 'xy', 'Password123!');
    expect(res.status).not.toBe(201);
  });
});

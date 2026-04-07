import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Registers with 7-char password (min-1 boundary), verifies API rejects it
test('AUTH-N6: Password at min-1 boundary 7 chars fails [BVA]', async () => {
  await test.step('TEST', async () => {
    const api = new ApiHelper();
    const res = await api.register(`bva-${Date.now()}@test.com`, `bvauser${Date.now()}`, '1234567');
    expect(res.status).not.toBe(201);
  });
});

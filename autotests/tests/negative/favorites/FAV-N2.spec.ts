import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Attempts to add favorite without authentication, verifies 401
test('FAV-N2: Add favorite without auth returns 401 [Cause-Effect]', async () => {
  await test.step('TEST', async () => {
    const unauthApi = new ApiHelper();
    const res = await unauthApi.addFavorite(1);
    expect(res.status).toBe(401);
  });
});

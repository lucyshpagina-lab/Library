import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Attempts to create book without authentication, verifies 401
test('CRUD-N6: Create book without auth returns 401 [Cause-Effect]', async () => {
  await test.step('TEST', async () => {
    const unauthApi = new ApiHelper();
    const res = await unauthApi.createBook({ title: 'Unauthorized', author: 'Hacker', genre: 'Horror', content: 'Fail' });
    expect(res.status).toBe(401);
  });
});

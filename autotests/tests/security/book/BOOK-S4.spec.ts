import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Attempts to create book without authentication, verifies 401
test('BOOK-S4: Create book without auth returns 401 [Authorization]', async () => {
  await test.step('TEST', async () => {
    const unauthApi = new ApiHelper();
    const res = await unauthApi.createBook({ title: 'Hacker Book', author: 'Hacker', genre: 'Horror', content: 'Unauthorized' });
    expect(res.status).toBe(401);
  });
});

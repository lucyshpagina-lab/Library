import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Attempts to delete book without authentication, verifies 401
test('BOOK-S3: Delete book without auth returns 401 [Authorization]', async () => {
  await test.step('TEST', async () => {
    const unauthApi = new ApiHelper();
    const res = await unauthApi.deleteBook(1);
    expect(res.status).toBe(401);
  });
});

import { test, expect } from '../../../fixtures/test.fixture';

// Attempts to favorite non-existent book (id=999999), verifies error response
test('FAV-N3: Favorite non-existent book returns error [Cause-Effect]', async ({ api }) => {
  await test.step('TEST', async () => {
    const res = await api.addFavorite(999999);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

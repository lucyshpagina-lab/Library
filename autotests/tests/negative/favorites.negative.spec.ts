import { test, expect } from '../../fixtures/test.fixture';
import { ApiHelper, log } from '../../helpers/api';

test.describe('❤️ Favorites [Negative]', () => {

  // ── State Transition ──

  test('FAV-N1: Add same book to favorites twice → 409 [State Transition]', async ({ api, bookSetup }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Add book to favorites', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
      const res = await api.addFavorite(bookId);
      log.precondition(`Book ${bookId} added to favorites (first time)`);
    });
    await test.step('🧪 TEST: Add same book again', async () => {
      const res = await api.addFavorite(bookId);
      log.test(`Attempted to add book ${bookId} again`);
      expect(res.status).toBe(409);
      log.success('State: duplicate favorite returns 409 "Already in favorites"');
    });
  });

  // ── Cause-Effect ──

  test('FAV-N2: Add favorite without auth → 401 [Cause-Effect]', async () => {
    await test.step('🧪 TEST: Add favorite without authentication', async () => {
      const unauthApi = new ApiHelper(); // no login
      const res = await unauthApi.addFavorite(1);
      log.test('Cause: no auth token, tried to add favorite');
      expect(res.status).toBe(401);
      log.success('Effect: 401 Unauthorized returned');
    });
  });

  test('FAV-N3: Favorite non-existent book → error [Cause-Effect]', async ({ api }) => {
    await test.step('🧪 TEST: Add non-existent book (id=999999) to favorites', async () => {
      const res = await api.addFavorite(999999);
      log.test('Cause: bookId=999999 does not exist');
      expect(res.status).toBeGreaterThanOrEqual(400);
      log.success('Effect: error returned for non-existent book');
    });
  });
});

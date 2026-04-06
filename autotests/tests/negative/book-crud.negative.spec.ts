import { test, expect } from '../../fixtures/test.fixture';
import { ApiHelper, log } from '../../helpers/api';

test.describe('📖 Book CRUD [Negative]', () => {

  // ── Equivalence Partitioning ──

  test('CRUD-N1: Create book with empty title rejected [EP]', async ({ api }) => {
    await test.step('🧪 TEST: Create book with empty title via API', async () => {
      const res = await api.createBook({
        title: '', author: 'Author', genre: 'Horror', content: 'Some content',
      });
      log.test('Submitted book with empty title ""');
      expect(res.status).toBeGreaterThanOrEqual(400);
      log.success('Empty title rejected by API');
    });
  });

  test('CRUD-N2: Rating value 0 rejected (below min) [EP]', async ({ api, bookSetup }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Get existing book', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
    });
    await test.step('🧪 TEST: Rate with value 0 via API', async () => {
      const res = await api.rateBook(bookId, 0);
      log.test('Submitted rating value=0 (below min 1)');
      expect(res.status).toBeGreaterThanOrEqual(400);
      log.success('Rating 0 rejected');
    });
  });

  test('CRUD-N3: Rating value 6 rejected (above max) [EP]', async ({ api, bookSetup }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Get existing book', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
    });
    await test.step('🧪 TEST: Rate with value 6 via API', async () => {
      const res = await api.rateBook(bookId, 6);
      log.test('Submitted rating value=6 (above max 5)');
      expect(res.status).toBeGreaterThanOrEqual(400);
      log.success('Rating 6 rejected');
    });
  });

  // ── Boundary Value Analysis ──

  test('CRUD-N4: Empty comment rejected (0 chars = min-1) [BVA]', async ({ api, bookSetup }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Get existing book', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
    });
    await test.step('🧪 TEST: Submit empty comment via API', async () => {
      const res = await api.addComment(bookId, '');
      log.test('Comment text="" (0 chars = min-1)');
      expect(res.status).toBeGreaterThanOrEqual(400);
      log.success('BVA: empty comment rejected');
    });
  });

  test('CRUD-N5: Comment 1001 chars rejected (max+1) [BVA]', async ({ api, bookSetup }) => {
    let bookId: number;
    await test.step('📋 PRECONDITION: Get existing book', async () => {
      const book = await bookSetup.getExistingBook();
      bookId = book.id;
    });
    await test.step('🧪 TEST: Submit 1001-char comment via API', async () => {
      const longComment = 'x'.repeat(1001);
      const res = await api.addComment(bookId, longComment);
      log.test(`Comment length=1001 chars (max+1)`);
      expect(res.status).toBeGreaterThanOrEqual(400);
      log.success('BVA: 1001-char comment rejected');
    });
  });

  // ── Cause-Effect ──

  test('CRUD-N6: Create book without auth → 401 [Cause-Effect]', async () => {
    await test.step('🧪 TEST: Create book without authentication', async () => {
      const unauthApi = new ApiHelper(); // no login
      const res = await unauthApi.createBook({
        title: 'Unauthorized Book', author: 'Hacker', genre: 'Horror', content: 'Should fail',
      });
      log.test('Cause: no auth token provided');
      expect(res.status).toBe(401);
      log.success('Effect: 401 Unauthorized returned');
    });
  });
});

import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// DB integrity tests for favorites — verifies favorite records via direct PostgreSQL queries

class NoopPre extends BasePreconditions {
  async setup() {}
}

// ── Positive: favorite exists in DB ──

class AddFavPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addFavorite(this.bookId);
  }
}

class VerifyFavoriteExists extends BaseTest {
  bookId!: number;
  async execute() {
    const me = await this.api.getMe();
    const userId = me.extract('user.id');
    const dbFav = await this.db.findFavorite(userId, this.bookId);
    expect(dbFav).not.toBeNull();
  }
}

class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-FAV-1: Added favorite exists in database [DB]', async ({ authenticatedPage, api }) => {
  const pre = new AddFavPre(api);
  const action = new VerifyFavoriteExists(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Positive: empty favorites = 0 records in DB ──

class VerifyNoFavorites extends BaseTest {
  async execute() {
    const me = await this.api.getMe();
    const dbFavs = await this.db.findFavoritesByUserId(me.extract('user.id'));
    expect(dbFavs.length).toBe(0);
  }
}

test('DB-FAV-2: New user has zero favorites in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new VerifyNoFavorites(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: duplicate favorite is not duplicated in DB ──

class DuplicateFavPre extends BasePreconditions {
  bookId!: number;
  async setup() {
    this.bookId = (await this.api.getBooks({ limit: '1' })).extract('books')[0].id;
    await this.api.addFavorite(this.bookId);
    await this.api.addFavorite(this.bookId); // duplicate attempt
  }
}

class VerifyNoDuplicate extends BaseTest {
  bookId!: number;
  async execute() {
    const me = await this.api.getMe();
    const userId = me.extract('user.id');
    const count = await this.db.countFavoritesByUserAndBook(userId, this.bookId);
    expect(count).toBe(1);
  }
}

test('DB-FAV-3: Duplicate favorite not stored in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new DuplicateFavPre(api);
  const action = new VerifyNoDuplicate(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.bookId = pre.bookId;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: non-existent book favorite not stored ──

class VerifyNoGhostFav extends BaseTest {
  async execute() {
    const fav = await this.db.rawQuery(
      'SELECT COUNT(*)::int as count FROM favorites WHERE book_id = $1',
      [999999],
    );
    expect(fav[0].count).toBe(0);
  }
}

test('DB-FAV-4: Favorite for non-existent book not in database [DB]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new VerifyNoGhostFav(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

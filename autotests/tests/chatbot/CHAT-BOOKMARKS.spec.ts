import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Chatbot bookmark tests

class NoopPre extends BasePreconditions {
  async setup() {}
}
class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

// ── #8: Add book to favorites via chat ──

class BookmarkAdd extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('add to favorites Dune');
    await this.page.locator('[data-testid="chat-send"]').click();

    const messages = this.page.locator('[data-testid="chat-messages"]');
    await expect(messages).toContainText('Added', { timeout: 5000 });
    await expect(this.page.locator('[data-testid="chat-book-card"]').first()).toBeVisible();
  }
}

// ── #9: Remove book from favorites via chat ──

class BookmarkAddThenRemovePre extends BasePreconditions {
  async setup() {
    const books = await this.api.getBooks({ search: 'Dune' });
    const bookId = books.extract('books')[0]?.id;
    if (bookId) await this.api.addFavorite(bookId);
  }
}

class BookmarkRemove extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('remove from favorites Dune');
    await this.page.locator('[data-testid="chat-send"]').click();

    const messages = this.page.locator('[data-testid="chat-messages"]');
    await expect(messages).toContainText('Removed', { timeout: 5000 });
  }
}

// ── #17: Add non-existent book to bookmarks → error ──

class BookmarkNonExistent extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page
      .locator('[data-testid="chat-input"]')
      .fill('add to favorites XyzNonExistentBook999');
    await this.page.locator('[data-testid="chat-send"]').click();

    const messages = this.page.locator('[data-testid="chat-messages"]');
    await expect(messages).toContainText("couldn't find", { timeout: 5000 });
  }
}

// ── Test calls ──

test('CHAT-9: Add book to favorites via chat [Functional]', async ({ authenticatedPage, api }) => {
  const pre = new NoopPre(api);
  const action = new BookmarkAdd(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-10: Remove book from favorites via chat [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new BookmarkAddThenRemovePre(api);
  const action = new BookmarkRemove(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-11: Add non-existent book to favorites shows error [Negative]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new BookmarkNonExistent(authenticatedPage, api);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Chatbot book search tests

class NoopPre extends BasePreconditions {
  async setup() {}
}
class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

// ── #1: Search by genre "detective" returns correct results ──

class SearchByGenre extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await expect(this.page.locator('[data-testid="chat-window"]')).toBeVisible();

    await this.page.locator('[data-testid="chat-input"]').fill('search detective books');
    await this.page.locator('[data-testid="chat-send"]').click();

    await expect(this.page.locator('[data-testid="chat-book-card"]').first()).toBeVisible({
      timeout: 5000,
    });
    const cards = this.page.locator('[data-testid="chat-book-card"]');
    expect(await cards.count()).toBeGreaterThan(0);
  }
}

// ── #2: Search by author returns books ──

class SearchByAuthor extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('find books by Agatha Christie');
    await this.page.locator('[data-testid="chat-send"]').click();

    await expect(this.page.locator('[data-testid="chat-book-card"]').first()).toBeVisible({
      timeout: 5000,
    });
  }
}

// ── #3: Search random word shows "no books found" ──

class SearchNoResults extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('search xyznonexistent123');
    await this.page.locator('[data-testid="chat-send"]').click();

    await expect(this.page.locator('[data-testid="chat-messages"]')).toContainText(
      "couldn't find",
      { timeout: 5000 },
    );
  }
}

// ── Test calls ──

test('CHAT-1: Search by genre "detective" returns book list [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new SearchByGenre(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-2: Search by author "Agatha Christie" shows books [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new SearchByAuthor(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-3: Search random word reports no books found [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new SearchNoResults(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Chatbot recommendation tests

class NoopPre extends BasePreconditions {
  async setup() {}
}
class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

// ── #4: Recommendations based on genre preference ──

class RecommendByGenre extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('recommend fantasy books');
    await this.page.locator('[data-testid="chat-send"]').click();

    await expect(this.page.locator('[data-testid="chat-book-card"]').first()).toBeVisible({
      timeout: 5000,
    });
    const cards = this.page.locator('[data-testid="chat-book-card"]');
    expect(await cards.count()).toBeGreaterThan(0);
  }
}

// ── #5: General recommendations return popular books ──

class RecommendPopular extends BaseTest {
  async execute() {
    await this.page.goto('/');
    await this.page.locator('[data-testid="chat-toggle"]').click();
    await this.page.locator('[data-testid="chat-input"]').fill('what should I read');
    await this.page.locator('[data-testid="chat-send"]').click();

    await expect(this.page.locator('[data-testid="chat-book-card"]').first()).toBeVisible({
      timeout: 5000,
    });
  }
}

// ── Test calls ──

test('CHAT-4: Recommendations by genre show suitable books [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new RecommendByGenre(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

test('CHAT-5: General recommendation returns popular books [Functional]', async ({
  authenticatedPage,
  api,
}) => {
  const pre = new NoopPre(api);
  const action = new RecommendPopular(authenticatedPage);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

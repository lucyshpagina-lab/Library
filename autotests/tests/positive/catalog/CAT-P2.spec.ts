import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Searches for "Dune" in catalog and verifies the book card appears

class Preconditions extends BasePreconditions {
  async setup() {
    // Relies on seeded "Dune" book
  }
}

class Test extends BaseTest {
  async execute() {
    const catalog = new CatalogPage(this.page);
    await catalog.open();
    await expect(catalog.bookCards.first()).toBeVisible({ timeout: 10000 });
    await catalog.searchFor('Dune');
    await this.page.waitForTimeout(1000);
    await expect(catalog.bookCardByTitle('Dune').first()).toBeVisible({ timeout: 10000 });
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CAT-P2: Search books by title [Use Case]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(page);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

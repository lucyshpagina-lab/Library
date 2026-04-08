import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTestAction, BasePostconditions } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Changes sort to Author A-Z and verifies books reload

class Preconditions extends BasePreconditions {
  async setup() {
    // Relies on seeded data
  }
}

class TestAction extends BaseTestAction {
  async execute() {
    const catalog = new CatalogPage(this.page);
    await catalog.open();
    await catalog.selectSort('author');
    await this.page.waitForTimeout(1000);
    await expect(catalog.bookCards.first()).toBeVisible();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CAT-P3: Sort books by author A-Z [EP: valid sort]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new TestAction(page);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTestAction, BasePostconditions } from '../../../helpers/BaseTest';
import { CatalogPage } from '../../../pages/CatalogPage';

// Opens catalog and verifies the sort dropdown defaults to Newest

class Preconditions extends BasePreconditions {
  async setup() {
    // Relies on seeded data
  }
}

class TestAction extends BaseTestAction {
  async execute() {
    const catalog = new CatalogPage(this.page);
    await catalog.open();
    await expect(catalog.sortSelect).toHaveValue('date');
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('CAT-P4: Default sort is Newest [State Transition]', async ({ page, api }) => {
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

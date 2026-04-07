import { test, expect } from '../../../fixtures/test.fixture';
import { BaseTest } from '../../../helpers/BaseTest';

// Creates book with empty title via API, verifies rejection
class CrudN1 extends BaseTest {
  async preconditions() {}
  async test() {
    const res = await this.api.createBook({ title: '', author: 'Author', genre: 'Horror', content: 'Content' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  }
  async postconditions() {}
}

test('CRUD-N1: Create book with empty title rejected [EP]', async ({ authenticatedPage, api }) => {
  const t = new CrudN1(authenticatedPage, api);
  await test.step('PRECONDITIONS', () => t.preconditions());
  try {
    await test.step('TEST', () => t.test());
  } finally {
    await test.step('POSTCONDITIONS', () => t.postconditions());
  }
});

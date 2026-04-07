import { test, expect } from '../../../fixtures/test.fixture';

// Creates book with empty title via API, verifies rejection with 400+
test('CRUD-N1: Create book with empty title rejected [EP]', async ({ api }) => {
  await test.step('TEST', async () => {
    const res = await api.createBook({ title: '', author: 'Author', genre: 'Horror', content: 'Some content' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

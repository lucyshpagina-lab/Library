import { test, expect } from '../../../fixtures/test.fixture';

// Sends 100KB payload as book content, verifies server handles gracefully without crash
test('API-S4: Oversized payload handled gracefully [DoS Protection]', async ({ api }) => {
  await test.step('TEST', async () => {
    const res = await api.createBook({
      title: 'Huge Book',
      author: 'Big Author',
      genre: 'Science Fiction',
      content: 'x'.repeat(100000),
    });
    expect([201, 400, 413, 422]).toContain(res.status);
  });

  await test.step('POSTCONDITIONS', async () => {
    await api.cleanupAll();
  });
});

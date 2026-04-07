import { test, expect } from '../../../fixtures/test.fixture';
import { ApiHelper } from '../../../helpers/api';

// Registers with XSS script tag as username, verifies it is rejected or stored safely
test('AUTH-S2: XSS in username during registration [XSS]', async () => {
  await test.step('TEST', async () => {
    const api = new ApiHelper();
    const res = await api.register(`xss-${Date.now()}@test.com`, '<script>alert("xss")</script>', 'Password123!');
    if (res.status === 201) {
      const stored = res.extract('user.username');
      expect(stored).not.toContain('<script>');
    }
  });
});

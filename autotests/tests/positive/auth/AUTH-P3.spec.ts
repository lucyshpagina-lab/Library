import { test, expect } from '../../../fixtures/test.fixture';
import { RegisterPage } from '../../../pages/RegisterPage';

// Registers with 3-char username (exact minimum boundary) and verifies success
test('AUTH-P3: Register with exact boundary username 3 chars [BVA]', async ({ page }) => {
  const id = Date.now();

  await test.step('PRECONDITIONS', async () => {
    await new RegisterPage(page).open();
  });

  await test.step('TEST', async () => {
    await new RegisterPage(page).register(`a${String(id).slice(-2)}`, `bva-${id}@test.com`, 'Password123!');
    await page.waitForURL('/', { timeout: 10000 });
  });
});

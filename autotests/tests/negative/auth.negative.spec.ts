import { test, expect } from '../../fixtures/test.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { ApiHelper, log } from '../../helpers/api';

test.describe('🔐 Authentication [Negative]', () => {

  // ── Equivalence Partitioning ──

  test('AUTH-N1: Invalid email format rejected [EP]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open register page', async () => {
      await new RegisterPage(page).open();
      log.precondition('Register page opened');
    });
    await test.step('🧪 TEST: Submit invalid email "not-an-email"', async () => {
      const reg = new RegisterPage(page);
      await reg.usernameInput.fill('testuser');
      await reg.emailInput.fill('not-an-email');
      await reg.passwordInput.fill('Password123!');
      await reg.confirmPasswordInput.fill('Password123!');
      await reg.submitButton.click();
      log.test('Submitted form with invalid email format');
    });
    await test.step('✅ VERIFY: Form rejects invalid email (browser validation)', async () => {
      // HTML5 email validation prevents submission — page stays on /register
      await expect(page).toHaveURL(/register/);
      log.success('Invalid email rejected — form not submitted');
    });
  });

  test('AUTH-N2: Short password rejected (7 chars) [EP]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open register page', async () => {
      await new RegisterPage(page).open();
      log.precondition('Register page opened');
    });
    await test.step('🧪 TEST: Submit with 7-char password', async () => {
      const reg = new RegisterPage(page);
      await reg.usernameInput.fill('shortpw');
      await reg.emailInput.fill('short@test.com');
      await reg.passwordInput.fill('1234567'); // 7 chars
      await reg.confirmPasswordInput.fill('1234567');
      await reg.submitButton.click();
      log.test('Submitted with password "1234567" (7 chars < min 8)');
    });
    await test.step('✅ VERIFY: Password rejected', async () => {
      await expect(page).toHaveURL(/register/);
      log.success('Short password rejected');
    });
  });

  test('AUTH-N3: Username too short (2 chars) rejected [EP]', async () => {
    await test.step('🧪 TEST: Register with 2-char username via API', async () => {
      const api = new ApiHelper();
      const res = await api.register('short@test.com', 'ab', 'Password123!');
      log.test('Attempted register with username "ab" (2 chars)');
      expect(res.status).not.toBe(201);
      log.success('Short username rejected by API');
    });
  });

  // ── Boundary Value Analysis ──

  test('AUTH-N4: Username at min-1 boundary (2 chars) fails [BVA]', async () => {
    await test.step('🧪 TEST: Register with 2-char username via API', async () => {
      const api = new ApiHelper();
      const res = await api.register(`bva-${Date.now()}@test.com`, 'xy', 'Password123!');
      log.test('Username "xy" (2 chars = min-1) submitted');
      expect(res.status).not.toBe(201);
      log.success('BVA: min-1 boundary correctly rejected');
    });
  });

  test('AUTH-N5: Username at max+1 boundary (21 chars) fails [BVA]', async () => {
    await test.step('🧪 TEST: Register with 21-char username via API', async () => {
      const api = new ApiHelper();
      const longName = 'a'.repeat(21);
      const res = await api.register(`bva-${Date.now()}@test.com`, longName, 'Password123!');
      log.test(`Username "${longName}" (21 chars = max+1) submitted`);
      expect(res.status).not.toBe(201);
      log.success('BVA: max+1 boundary correctly rejected');
    });
  });

  test('AUTH-N6: Password at min-1 boundary (7 chars) fails [BVA]', async () => {
    await test.step('🧪 TEST: Register with 7-char password via API', async () => {
      const api = new ApiHelper();
      const res = await api.register(`bva-${Date.now()}@test.com`, `bvauser${Date.now()}`, '1234567');
      log.test('Password "1234567" (7 chars = min-1) submitted');
      expect(res.status).not.toBe(201);
      log.success('BVA: password min-1 boundary correctly rejected');
    });
  });

  // ── State Transition ──

  test('AUTH-N7: Login with wrong creds → oops screen [State Transition]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open login page', async () => {
      await new LoginPage(page).open();
      log.precondition('Login page opened');
    });
    await test.step('🧪 TEST: Submit wrong password', async () => {
      await new LoginPage(page).login('nonexistent@test.com', 'wrongpassword');
      log.test('Wrong credentials submitted');
    });
    await test.step('✅ VERIFY: Oops screen shown (not redirected)', async () => {
      await expect(new LoginPage(page).tryAgainButton).toBeVisible({ timeout: 10000 });
      log.success('State remains on login with oops animation');
    });
  });

  // ── Cause-Effect ──

  test('AUTH-N8: Passwords mismatch → error message [Cause-Effect]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open register page', async () => {
      await new RegisterPage(page).open();
      log.precondition('Register page opened');
    });
    await test.step('🧪 TEST: Submit mismatched passwords', async () => {
      const reg = new RegisterPage(page);
      await reg.usernameInput.fill('mismatch');
      await reg.emailInput.fill('mismatch@test.com');
      await reg.passwordInput.fill('Password123!');
      await reg.confirmPasswordInput.fill('DifferentPass!');
      await reg.submitButton.click();
      log.test('Cause: passwords "Password123!" vs "DifferentPass!"');
    });
    await test.step('✅ VERIFY: "Passwords do not match" error', async () => {
      await expect(page.locator('.bg-red-50')).toContainText('Passwords do not match', { timeout: 5000 });
      log.success('Effect: "Passwords do not match" error displayed');
    });
  });
});

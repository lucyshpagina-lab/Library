import { test, expect } from '../fixtures/test.fixture';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { log } from '../helpers/api';

test.describe('🔐 Authentication', () => {

  test('AUTH-1: Register a new user via UI', async ({ page }) => {
    const id = Date.now();
    const username = `newuser${id}`;
    const email = `newuser-${id}@test.com`;

    await test.step('📋 PRECONDITION: Navigate to register page', async () => {
      const registerPage = new RegisterPage(page);
      await registerPage.open();
      log.precondition('Register page opened');
      log.success('Register form is visible');
    });

    await test.step('🧪 TEST: Fill and submit register form', async () => {
      const registerPage = new RegisterPage(page);
      await registerPage.register(username, email, 'Password123!');
      log.test(`Registering user "${username}" with email "${email}"`);
      await page.waitForURL('/', { timeout: 10000 });
      log.success('User registered and redirected to home');
    });

    await test.step('✅ VERIFY: Home page is displayed', async () => {
      const home = new HomePage(page);
      await expect(home.heroTitle).toBeVisible();
      log.test('Home page hero title is visible');
      log.success('Registration flow completed successfully');
    });
  });

  test('AUTH-2: Show oops animation on invalid login', async ({ page }) => {
    await test.step('📋 PRECONDITION: Navigate to login page', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.open();
      log.precondition('Login page opened');
      log.success('Login form is ready');
    });

    await test.step('🧪 TEST: Submit wrong credentials', async () => {
      const loginPage = new LoginPage(page);
      await loginPage.login('fake@nonexistent.com', 'wrongpassword');
      log.test('Submitted invalid email and password');
    });

    await test.step('✅ VERIFY: Oops animation appears with Try Again button', async () => {
      const loginPage = new LoginPage(page);
      await expect(loginPage.tryAgainButton).toBeVisible({ timeout: 10000 });
      log.test('Oops screen with 🫣 emoji is displayed');
      log.success('Invalid login shows oops animation correctly');
    });
  });

  test('AUTH-3: Show error when passwords do not match on register', async ({ page }) => {
    await test.step('📋 PRECONDITION: Navigate to register page', async () => {
      const registerPage = new RegisterPage(page);
      await registerPage.open();
      log.precondition('Register page opened');
    });

    await test.step('🧪 TEST: Fill mismatched passwords and submit', async () => {
      const registerPage = new RegisterPage(page);
      await registerPage.usernameInput.fill('testuser');
      await registerPage.emailInput.fill('mismatch@test.com');
      await registerPage.passwordInput.fill('Password123!');
      await registerPage.confirmPasswordInput.fill('DifferentPass!');
      await registerPage.submitButton.click();
      log.test('Submitted form with mismatched passwords');
    });

    await test.step('✅ VERIFY: Error message is displayed', async () => {
      await expect(page.locator('.bg-red-50')).toContainText('Passwords do not match', { timeout: 5000 });
      log.success('Password mismatch error shown correctly');
    });
  });
});

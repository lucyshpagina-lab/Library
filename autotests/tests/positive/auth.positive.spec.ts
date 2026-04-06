import { test, expect } from '../../fixtures/test.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { HomePage } from '../../pages/HomePage';
import { log } from '../../helpers/api';

test.describe('🔐 Authentication [Positive]', () => {

  test('AUTH-P1: Register new user via UI [Use Case]', async ({ page }) => {
    const id = Date.now();
    await test.step('📋 PRECONDITION: Open register page', async () => {
      await new RegisterPage(page).open();
      log.precondition('Register page opened');
    });
    await test.step('🧪 TEST: Fill form and submit', async () => {
      await new RegisterPage(page).register(`user${id}`, `user-${id}@test.com`, 'Password123!');
      log.test('Registration form submitted');
    });
    await test.step('✅ VERIFY: Redirected to home', async () => {
      await page.waitForURL('/', { timeout: 10000 });
      await expect(new HomePage(page).heroTitle).toBeVisible();
      log.success('User registered and redirected to home page');
    });
  });

  test('AUTH-P2: Login shows oops then Try Again works [State Transition]', async ({ page }) => {
    await test.step('📋 PRECONDITION: Open login page', async () => {
      await new LoginPage(page).open();
      log.precondition('Login page opened');
    });
    await test.step('🧪 TEST: Submit wrong credentials', async () => {
      await new LoginPage(page).login('fake@test.com', 'wrongpass');
      log.test('Wrong credentials submitted');
    });
    await test.step('✅ VERIFY: Oops screen appears with Try Again', async () => {
      const loginPage = new LoginPage(page);
      await expect(loginPage.tryAgainButton).toBeVisible({ timeout: 10000 });
      log.success('Oops animation shown with Try Again button');
    });
  });

  test('AUTH-P3: Register with exact boundary username (3 chars) [BVA]', async ({ page }) => {
    const id = Date.now();
    await test.step('📋 PRECONDITION: Open register page', async () => {
      await new RegisterPage(page).open();
      log.precondition('Register page opened');
    });
    await test.step('🧪 TEST: Register with 3-char username (minimum)', async () => {
      await new RegisterPage(page).register('abc', `bva-${id}@test.com`, 'Password123!');
      log.test('Submitted with username "abc" (3 chars = min boundary)');
    });
    await test.step('✅ VERIFY: Registration succeeds', async () => {
      await page.waitForURL('/', { timeout: 10000 });
      log.success('3-char username accepted (boundary value pass)');
    });
  });
});

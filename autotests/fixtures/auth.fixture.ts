import { test as base, Page, BrowserContext } from '@playwright/test';
import { ApiHelper } from '../helpers/api';

type AuthFixtures = {
  api: ApiHelper;
  authenticatedPage: Page;
  testUser: { email: string; username: string; password: string };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const id = Date.now();
    await use({
      email: `test-${id}@library.test`,
      username: `tester${id}`,
      password: 'TestPass123!',
    });
  },

  api: async ({ testUser }, use) => {
    const api = new ApiHelper();
    await api.register(testUser.email, testUser.username, testUser.password);
    await use(api);
  },

  authenticatedPage: async ({ browser, api }, use) => {
    const context = await browser.newContext();
    // Set the auth cookie
    await context.addCookies([{
      name: 'token',
      value: api.getToken()!,
      domain: 'localhost',
      path: '/',
    }]);
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

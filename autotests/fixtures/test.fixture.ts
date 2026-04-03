import { test as base, Page } from '@playwright/test';
import { ApiHelper, log } from '../helpers/api';

type TestFixtures = {
  api: ApiHelper;
  authenticatedPage: Page;
  testUser: { email: string; username: string; password: string };
};

export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const id = Date.now() + Math.floor(Math.random() * 10000);
    await use({
      email: `autotest-${id}@library.test`,
      username: `tester${id}`,
      password: 'AutoTest123!',
    });
  },

  api: async ({ testUser }, use) => {
    const api = new ApiHelper();

    await base.step('🔧 PRECONDITION: Register test user', async () => {
      const res = await api.register(testUser.email, testUser.username, testUser.password);
      res.statusCode(201).hasField('user.id');
      log.precondition(`User "${testUser.username}" registered (${testUser.email})`);
      log.success('Test user is ready');
    });

    await use(api);

    // POSTCONDITION: cleanup
    await base.step('🧹 POSTCONDITION: Cleanup test data', async () => {
      log.postcondition('Cleaning up all test data...');
      await api.cleanupAll();
      log.success('All test data removed');
    });
  },

  authenticatedPage: async ({ browser, api }, use) => {
    const context = await browser.newContext();
    const token = api.getToken();
    if (token) {
      await context.addCookies([{
        name: 'token',
        value: token,
        domain: 'localhost',
        path: '/',
      }]);
    }
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

import { test as base, Page } from '@playwright/test';
import { ApiHelper } from '../helpers/api';
import { AuthSetup } from '../preconditions/AuthSetup';
import { BookSetup } from '../preconditions/BookSetup';
import { FavoriteSetup } from '../preconditions/FavoriteSetup';
import { AuthCleanup } from '../postconditions/AuthCleanup';
import { BookCleanup } from '../postconditions/BookCleanup';
import { FavoriteCleanup } from '../postconditions/FavoriteCleanup';
import { Postconditions } from '../postconditions/Postconditions';

type TestFixtures = {
  api: ApiHelper;
  authSetup: AuthSetup;
  bookSetup: BookSetup;
  favoriteSetup: FavoriteSetup;
  authCleanup: AuthCleanup;
  bookCleanup: BookCleanup;
  favoriteCleanup: FavoriteCleanup;
  postconditions: Postconditions;
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
    await base.step('PRECONDITIONS: Register test user', async () => {
      const res = await api.register(testUser.email, testUser.username, testUser.password);
      res.statusCode(201).hasField('user.id');
    });
    await use(api);
    await base.step('POSTCONDITIONS: Cleanup all test data', async () => {
      await api.cleanupAll();
    });
  },

  authSetup: async ({ api }, use) => { await use(new AuthSetup(api)); },
  bookSetup: async ({ api }, use) => { await use(new BookSetup(api)); },
  favoriteSetup: async ({ api }, use) => { await use(new FavoriteSetup(api)); },
  authCleanup: async ({ api }, use) => { await use(new AuthCleanup(api)); },
  bookCleanup: async ({ api }, use) => { await use(new BookCleanup(api)); },
  favoriteCleanup: async ({ api }, use) => { await use(new FavoriteCleanup(api)); },
  postconditions: async ({ api }, use) => { await use(new Postconditions(api)); },

  authenticatedPage: async ({ browser, api }, use) => {
    const context = await browser.newContext();
    const token = api.getToken();
    if (token) {
      await context.addCookies([{
        name: 'token', value: token, domain: 'localhost', path: '/',
      }]);
    }
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

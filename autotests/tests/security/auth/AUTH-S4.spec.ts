import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Compares login response times for existing vs non-existing email

class Preconditions extends BasePreconditions {
  email = '';
  async setup() {
    const api = new ApiHelper();
    this.email = `timing-${Date.now()}@test.com`;
    await api.register(this.email, `timing${Date.now()}`, 'Password123!');
  }
}

class Test extends BaseTest {
  constructor(
    page: import('@playwright/test').Page,
    private email: string,
  ) {
    super(page);
  }
  async execute() {
    const api = new ApiHelper();
    const t1 = Date.now();
    await api.login(this.email, 'wrong');
    const d1 = Date.now() - t1;
    const t2 = Date.now();
    await api.login('fake@none.com', 'wrong');
    const d2 = Date.now() - t2;
    expect(Math.abs(d1 - d2)).toBeLessThan(500);

    // DB integrity: timing check is read-only
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('AUTH-S4: Login timing attack check [Security]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  await test.step('PRECONDITIONS', () => pre.setup());

  const action = new Test(page, pre.email);
  const post = new Postconditions(api);

  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';
import { ApiHelper } from '../../../helpers/api';

// Registers with 2-char username via API, verifies rejection (min is 3)

class Preconditions extends BasePreconditions {
  async setup() {
    // No setup needed
  }
}

class Test extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    const res = await api.register('short@test.com', 'ab', 'Password123!');
    expect(res.status).not.toBe(201);
    // DB verification in tests/db/
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    // No cleanup needed — invalid data was never created
  }
}

test('AUTH-N3: Username too short 2 chars rejected [EP]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(page);
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

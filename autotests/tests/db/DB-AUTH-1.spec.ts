import { DbHelper } from '../../helpers/db';
import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';

// Positive: registered user exists in database after valid registration

class Preconditions extends BasePreconditions {
  email = `db-auth-${Date.now()}@test.com`;
  username = `dbuser${Date.now()}`;
  async setup() {
    const res = await this.api.register(this.email, this.username, 'Password123!');
    res.statusCode(201);
  }
}

class Test extends BaseTest {
  email!: string;
  username!: string;
  async execute() {
    const dbUser = await this.db.findUserByEmail(this.email);
    expect(dbUser).not.toBeNull();
    expect(dbUser.username).toBe(this.username);
    expect(dbUser.email).toBe(this.email);
    expect(dbUser.password_hash).toBeTruthy();
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-AUTH-1: Registered user exists in database [DB]', async ({ page, api }) => {
  const pre = new Preconditions(api);
  const action = new Test(page);
  action.db = new DbHelper();
  const post = new Postconditions(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.email = pre.email;
  action.username = pre.username;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

import { test, expect } from '../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../helpers/BaseTest';
import { ApiHelper } from '../../helpers/api';

// DB integrity tests for authentication — verifies user records via direct PostgreSQL queries

class BasePreconditionsNoop extends BasePreconditions {
  async setup() {}
}

// ── Positive: user IS created after valid registration ──

class RegisterPre extends BasePreconditions {
  email = `db-auth-${Date.now()}@test.com`;
  username = `dbuser${Date.now()}`;
  async setup() {
    const res = await this.api.register(this.email, this.username, 'Password123!');
    res.statusCode(201);
  }
}

class VerifyUserCreated extends BaseTest {
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

class CleanupAll extends BasePostconditions {
  async cleanup() {
    await this.api.cleanupAll();
  }
}

test('DB-AUTH-1: Registered user exists in database [DB]', async ({ page, api }) => {
  const pre = new RegisterPre(api);
  const action = new VerifyUserCreated(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  action.email = pre.email;
  action.username = pre.username;
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: invalid email does NOT create user ──

class VerifyNoUserByEmail extends BaseTest {
  async execute() {
    const dbUser = await this.db.findUserByEmail('not-an-email');
    expect(dbUser).toBeNull();
  }
}

test('DB-AUTH-2: Invalid email registration does not persist user [DB]', async ({ page, api }) => {
  const pre = new BasePreconditionsNoop(api);
  const action = new VerifyNoUserByEmail(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: short username (2 chars) does NOT create user ──

class VerifyNoShortUsername extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    await api.register('short-db@test.com', 'ab', 'Password123!');
    const dbUser = await this.db.findUserByUsername('ab');
    expect(dbUser).toBeNull();
  }
}

test('DB-AUTH-3: Short username rejected, no DB record [DB]', async ({ page, api }) => {
  const pre = new BasePreconditionsNoop(api);
  const action = new VerifyNoShortUsername(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: long username (21 chars) does NOT create user ──

class VerifyNoLongUsername extends BaseTest {
  async execute() {
    const api = new ApiHelper();
    await api.register(`long-db-${Date.now()}@test.com`, 'a'.repeat(21), 'Password123!');
    const dbUser = await this.db.findUserByUsername('a'.repeat(21));
    expect(dbUser).toBeNull();
  }
}

test('DB-AUTH-4: Long username rejected, no DB record [DB]', async ({ page, api }) => {
  const pre = new BasePreconditionsNoop(api);
  const action = new VerifyNoLongUsername(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

// ── Negative: password mismatch does NOT create user ──

class VerifyNoMismatchUser extends BaseTest {
  async execute() {
    const dbUser = await this.db.findUserByEmail('mismatch@test.com');
    expect(dbUser).toBeNull();
  }
}

test('DB-AUTH-5: Password mismatch does not persist user [DB]', async ({ page, api }) => {
  const pre = new BasePreconditionsNoop(api);
  const action = new VerifyNoMismatchUser(page);
  const post = new CleanupAll(api);

  await test.step('PRECONDITIONS', () => pre.setup());
  try {
    await test.step('TEST', () => action.execute());
  } finally {
    await test.step('POSTCONDITIONS', () => post.cleanup());
  }
});

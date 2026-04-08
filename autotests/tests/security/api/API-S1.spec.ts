import { test, expect } from '../../../fixtures/test.fixture';
import { BasePreconditions, BaseTest, BasePostconditions } from '../../../helpers/BaseTest';

// Sends request with tampered JWT signature, verifies 401

class Preconditions extends BasePreconditions {
  async setup() {}
}

class Test extends BaseTest {
  async execute() {
    const res = await fetch('http://localhost:4000/api/auth/me', {
      headers: { Cookie: 'token=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.TAMPERED' },
    });
    expect(res.status).toBe(401);
    expect((await res.json()).error).toContain('Invalid');
  }
}

class Postconditions extends BasePostconditions {
  async cleanup() {}
}

test('API-S1: Tampered JWT token rejected [Token Security]', async ({ page, api }) => {
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

import { ApiHelper, log } from '../helpers/api';

export class AuthSetup {
  constructor(private api: ApiHelper) {}

  async createTestUser(opts?: { email?: string; username?: string; password?: string }) {
    const id = Date.now() + Math.floor(Math.random() * 10000);
    const email = opts?.email || `autotest-${id}@library.test`;
    const username = opts?.username || `tester${id}`;
    const password = opts?.password || 'AutoTest123!';

    const res = await this.api.register(email, username, password);
    res.statusCode(201).hasField('user.id');
    log.precondition(`User "${username}" created (${email})`);
    return { email, username, password, userId: res.extract('user.id') };
  }

  async loginUser(email: string, password: string) {
    const res = await this.api.login(email, password);
    res.statusCode(200).hasField('user.id');
    log.precondition(`User "${email}" logged in`);
    return res.extract('user');
  }
}

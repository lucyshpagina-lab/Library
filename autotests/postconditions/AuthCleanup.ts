import { ApiHelper, log } from '../helpers/api';

export class AuthCleanup {
  constructor(private api: ApiHelper) {}

  async cleanupAll() {
    await this.api.cleanupAll();
    log.postcondition('All test data cleaned up (users, books, favorites)');
  }
}

import { ApiHelper, log } from '../helpers/api';

export class FavoriteCleanup {
  constructor(private api: ApiHelper) {}

  async removeFavorite(bookId: number) {
    await this.api.removeFavorite(bookId).catch(() => {});
    log.postcondition(`Favorite for book ${bookId} removed`);
  }
}

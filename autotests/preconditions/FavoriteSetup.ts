import { ApiHelper, log } from '../helpers/api';

export class FavoriteSetup {
  constructor(private api: ApiHelper) {}

  async addFavorite(bookId: number, bookTitle?: string) {
    const res = await this.api.addFavorite(bookId);
    log.precondition(`Added "${bookTitle || bookId}" to favorites`);
    return res;
  }
}

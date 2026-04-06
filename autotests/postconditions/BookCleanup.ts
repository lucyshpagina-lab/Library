import { ApiHelper, log } from '../helpers/api';

export class BookCleanup {
  constructor(private api: ApiHelper) {}

  async deleteBook(bookId: number) {
    await this.api.deleteBook(bookId);
    log.postcondition(`Book ${bookId} deleted`);
  }

  async deleteAllCreated() {
    const ids = this.api.getCreatedBookIds();
    for (const id of ids) {
      await this.api.deleteBook(id).catch(() => {});
    }
    if (ids.length) log.postcondition(`${ids.length} test book(s) deleted`);
  }
}

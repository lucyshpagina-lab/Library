import { ApiHelper, log } from '../helpers/api';

/**
 * Unified postconditions class that cleans up all resources
 * created during the preconditions phase of a test via API calls.
 *
 * Tracks created resource IDs and deletes them in reverse order
 * to respect foreign key constraints.
 */
export class Postconditions {
  private api: ApiHelper;
  private bookIds: number[] = [];
  private favoriteBookIds: number[] = [];
  private userCredentials: { email: string; password: string }[] = [];

  constructor(api: ApiHelper) {
    this.api = api;
  }

  /** Register a book ID created in preconditions for later cleanup */
  trackBook(bookId: number) {
    this.bookIds.push(bookId);
  }

  /** Register a favorite (by book ID) created in preconditions for later cleanup */
  trackFavorite(bookId: number) {
    this.favoriteBookIds.push(bookId);
  }

  /** Register user credentials created in preconditions for later cleanup */
  trackUser(email: string, password: string) {
    this.userCredentials.push({ email, password });
  }

  /**
   * Delete all tracked resources via API calls.
   * Order: favorites → books → users (reverse of typical creation order).
   */
  async cleanup() {
    // 1. Remove favorites first (depends on books existing)
    for (const bookId of this.favoriteBookIds) {
      try {
        await this.api.removeFavorite(bookId);
        log.postcondition(`Favorite for book ${bookId} removed`);
      } catch {
        log.postcondition(`Failed to remove favorite for book ${bookId} (may already be gone)`);
      }
    }

    // 2. Delete books (cascades comments, ratings, reading progress)
    for (const bookId of this.bookIds) {
      try {
        await this.api.deleteBook(bookId);
        log.postcondition(`Book ${bookId} deleted`);
      } catch {
        log.postcondition(`Failed to delete book ${bookId} (may already be gone)`);
      }
    }

    // 3. Clean up everything else tracked by ApiHelper (users, etc.)
    await this.api.cleanupAll();
    log.postcondition('All remaining test data cleaned up');

    // Reset tracked IDs
    this.bookIds = [];
    this.favoriteBookIds = [];
    this.userCredentials = [];
  }
}

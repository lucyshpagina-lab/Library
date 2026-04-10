import pg from 'pg';

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://lucy:password@localhost:5432/library_dev';

let pool: InstanceType<typeof pg.Pool> | null = null;

function getPool() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: DATABASE_URL, max: 3 });
  }
  return pool;
}

export class DbHelper {
  private async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const { rows } = await getPool().query(sql, params);
    return rows as T[];
  }

  // ── Users ──
  async findUserByEmail(email: string) {
    const rows = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  }

  async findUserByUsername(username: string) {
    const rows = await this.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] || null;
  }

  async findUserById(id: number) {
    const rows = await this.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async countUsersByEmailPattern(pattern: string) {
    const rows = await this.query('SELECT COUNT(*)::int as count FROM users WHERE email LIKE $1', [
      pattern,
    ]);
    return rows[0].count;
  }

  // ── Books ──
  async findBookById(id: number) {
    const rows = await this.query('SELECT * FROM books WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async findBookByTitle(title: string) {
    const rows = await this.query('SELECT * FROM books WHERE title = $1', [title]);
    return rows[0] || null;
  }

  async countBooksByTitle(title: string) {
    const rows = await this.query('SELECT COUNT(*)::int as count FROM books WHERE title = $1', [
      title,
    ]);
    return rows[0].count;
  }

  // ── Comments ──
  async findCommentsByBookId(bookId: number) {
    const rows = await this.query(
      'SELECT * FROM comments WHERE book_id = $1 ORDER BY created_at DESC',
      [bookId],
    );
    return rows;
  }

  async countCommentsByBookId(bookId: number) {
    const rows = await this.query(
      'SELECT COUNT(*)::int as count FROM comments WHERE book_id = $1',
      [bookId],
    );
    return rows[0].count;
  }

  async findCommentByText(bookId: number, text: string) {
    const rows = await this.query('SELECT * FROM comments WHERE book_id = $1 AND text = $1', [
      bookId,
    ]);
    return rows.filter((r: any) => r.text === text);
  }

  // ── Ratings ──
  async findRating(userId: number, bookId: number) {
    const rows = await this.query('SELECT * FROM ratings WHERE user_id = $1 AND book_id = $2', [
      userId,
      bookId,
    ]);
    return rows[0] || null;
  }

  async findRatingsByBookId(bookId: number) {
    const rows = await this.query('SELECT * FROM ratings WHERE book_id = $1', [bookId]);
    return rows;
  }

  // ── Favorites ──
  async findFavorite(userId: number, bookId: number) {
    const rows = await this.query('SELECT * FROM favorites WHERE user_id = $1 AND book_id = $2', [
      userId,
      bookId,
    ]);
    return rows[0] || null;
  }

  async countFavoritesByUserAndBook(userId: number, bookId: number) {
    const rows = await this.query(
      'SELECT COUNT(*)::int as count FROM favorites WHERE user_id = $1 AND book_id = $2',
      [userId, bookId],
    );
    return rows[0].count;
  }

  async findFavoritesByUserId(userId: number) {
    const rows = await this.query('SELECT * FROM favorites WHERE user_id = $1', [userId]);
    return rows;
  }

  // ── Generic ──
  async rawQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return this.query<T>(sql, params);
  }
}

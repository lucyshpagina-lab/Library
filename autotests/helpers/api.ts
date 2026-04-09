const API_URL = 'http://localhost:4000/api';

// Color console output
const log = {
  precondition: (msg: string) => console.log(`\x1b[36m  [PRECONDITION] \x1b[0m${msg}`),
  test: (msg: string) => console.log(`\x1b[33m  [TEST]         \x1b[0m${msg}`),
  postcondition: (msg: string) => console.log(`\x1b[35m  [POSTCONDITION]\x1b[0m${msg}`),
  success: (msg: string) => console.log(`\x1b[32m  ✓ ${msg}\x1b[0m`),
  info: (msg: string) => console.log(`\x1b[90m    → ${msg}\x1b[0m`),
};

export { log };

// ── REST Assured style response validator ──
class RestResponse {
  constructor(
    public status: number,
    public body: any,
    public headers: Headers,
  ) {}

  statusCode(expected: number): RestResponse {
    if (this.status !== expected) {
      throw new Error(
        `Expected status ${expected}, got ${this.status}. Body: ${JSON.stringify(this.body)}`,
      );
    }
    return this;
  }

  hasField(field: string): RestResponse {
    const keys = field.split('.');
    let val: any = this.body;
    for (const k of keys) {
      if (val === undefined || val === null)
        throw new Error(`Field "${field}" not found in response`);
      val = val[k];
    }
    if (val === undefined) throw new Error(`Field "${field}" not found in response`);
    return this;
  }

  fieldEquals(field: string, expected: any): RestResponse {
    const keys = field.split('.');
    let val: any = this.body;
    for (const k of keys) val = val?.[k];
    if (val !== expected) throw new Error(`Expected "${field}" = ${expected}, got ${val}`);
    return this;
  }

  extract(field: string): any {
    const keys = field.split('.');
    let val: any = this.body;
    for (const k of keys) val = val?.[k];
    return val;
  }
}

// ── API Helper ──
export class ApiHelper {
  private token: string | null = null;
  private createdUserIds: number[] = [];
  private createdBookIds: number[] = [];
  private createdFavoriteBookIds: number[] = [];
  private createdCommentIds: number[] = [];

  private async request(
    method: string,
    path: string,
    body?: any,
    auth = false,
  ): Promise<RestResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth && this.token) headers['Cookie'] = `token=${this.token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const setCookie = res.headers.get('set-cookie') || '';
    const tokenMatch = setCookie.match(/token=([^;]+)/);
    if (tokenMatch) this.token = tokenMatch[1];

    let data: any;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return new RestResponse(res.status, data, res.headers);
  }

  // ── Auth ──
  async register(email: string, username: string, password: string): Promise<RestResponse> {
    const res = await this.request('POST', '/auth/register', { email, username, password });
    if (res.status === 201 && res.body?.user?.id) {
      this.createdUserIds.push(res.body.user.id);
    }
    return res;
  }

  async login(email: string, password: string): Promise<RestResponse> {
    return this.request('POST', '/auth/login', { email, password });
  }

  async getMe(): Promise<RestResponse> {
    return this.request('GET', '/auth/me', undefined, true);
  }

  // ── Books ──
  async createBook(data: {
    title: string;
    author: string;
    genre: string;
    content: string;
    description?: string;
    pageCount?: number;
    publishedYear?: number;
  }): Promise<RestResponse> {
    const res = await this.request('POST', '/books', data, true);
    if (res.status === 201 && res.body?.book?.id) {
      this.createdBookIds.push(res.body.book.id);
    }
    return res;
  }

  async deleteBook(id: number): Promise<RestResponse> {
    return this.request('DELETE', `/books/${id}`, undefined, true);
  }

  async getBook(id: number): Promise<RestResponse> {
    return this.request('GET', `/books/${id}`, undefined, true);
  }

  async getBooks(params?: Record<string, string>): Promise<RestResponse> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request('GET', `/books${query}`);
  }

  // ── Favorites ──
  async addFavorite(bookId: number): Promise<RestResponse> {
    const res = await this.request('POST', '/favorites', { bookId }, true);
    if (res.status < 300) this.createdFavoriteBookIds.push(bookId);
    return res;
  }

  async removeFavorite(bookId: number): Promise<RestResponse> {
    return this.request('DELETE', `/favorites/${bookId}`, undefined, true);
  }

  async getFavorites(): Promise<RestResponse> {
    return this.request('GET', '/favorites', undefined, true);
  }

  // ── Comments & Ratings ──
  async addComment(bookId: number, text: string): Promise<RestResponse> {
    const res = await this.request('POST', `/books/${bookId}/comments`, { text }, true);
    if (res.body?.comment?.id) this.createdCommentIds.push(res.body.comment.id);
    return res;
  }

  async rateBook(bookId: number, value: number): Promise<RestResponse> {
    return this.request('POST', `/books/${bookId}/ratings`, { value }, true);
  }

  // ── Cleanup ──
  async cleanupAll(): Promise<void> {
    // Remove favorites
    for (const bookId of this.createdFavoriteBookIds) {
      await this.request('DELETE', `/favorites/${bookId}`, undefined, true).catch(() => {});
    }
    // Delete books (cascades comments, ratings, etc.)
    for (const id of this.createdBookIds) {
      await this.request('DELETE', `/books/${id}`, undefined, true).catch(() => {});
    }
    this.createdFavoriteBookIds = [];
    this.createdBookIds = [];
    this.createdCommentIds = [];
    this.createdUserIds = [];
  }

  getToken() {
    return this.token;
  }
  getCreatedBookIds() {
    return [...this.createdBookIds];
  }
  getCreatedUserIds() {
    return [...this.createdUserIds];
  }
}

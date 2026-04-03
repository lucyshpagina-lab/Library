const API_URL = 'http://localhost:4000/api';

export class ApiHelper {
  private token: string | null = null;

  private async fetchJson(method: string, path: string, body?: any, auth = false): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth && this.token) headers['Cookie'] = `token=${this.token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Extract token from set-cookie header
    const setCookie = res.headers.get('set-cookie') || '';
    const tokenMatch = setCookie.match(/token=([^;]+)/);
    if (tokenMatch) this.token = tokenMatch[1];

    return res.json();
  }

  async register(email: string, username: string, password: string) {
    return this.fetchJson('POST', '/auth/register', { email, username, password });
  }

  async login(email: string, password: string) {
    return this.fetchJson('POST', '/auth/login', { email, password });
  }

  async createBook(data: {
    title: string;
    author: string;
    genre: string;
    content: string;
    description?: string;
    pageCount?: number;
    publishedYear?: number;
  }) {
    return this.fetchJson('POST', '/books', data, true);
  }

  async deleteBook(id: number) {
    return this.fetchJson('DELETE', `/books/${id}`, undefined, true);
  }

  async getBooks(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.fetchJson('GET', `/books${query}`);
  }

  async getBook(id: number) {
    return this.fetchJson('GET', `/books/${id}`);
  }

  async addFavorite(bookId: number) {
    return this.fetchJson('POST', '/favorites', { bookId }, true);
  }

  async addComment(bookId: number, text: string) {
    return this.fetchJson('POST', `/books/${bookId}/comments`, { text }, true);
  }

  async rateBook(bookId: number, value: number) {
    return this.fetchJson('POST', `/books/${bookId}/ratings`, { value }, true);
  }

  getToken() {
    return this.token;
  }
}

import { ApiHelper, log } from '../helpers/api';

export class BookSetup {
  constructor(private api: ApiHelper) {}

  async createTestBook(overrides?: Partial<{
    title: string; author: string; genre: string; content: string;
    description: string; pageCount: number; publishedYear: number;
  }>) {
    const id = Date.now();
    const data = {
      title: overrides?.title || `Test Book ${id}`,
      author: overrides?.author || 'Test Author',
      genre: overrides?.genre || 'Science Fiction',
      content: overrides?.content || 'Automated test content for this book.',
      description: overrides?.description || 'Created by automated tests.',
      pageCount: overrides?.pageCount || 100,
      publishedYear: overrides?.publishedYear || 2025,
    };
    const res = await this.api.createBook(data);
    res.statusCode(201).hasField('book.id');
    const bookId = res.extract('book.id');
    log.precondition(`Book "${data.title}" created (id: ${bookId})`);
    return { ...data, id: bookId };
  }

  async getExistingBook() {
    const res = await this.api.getBooks({ limit: '1' });
    res.statusCode(200).hasField('books');
    const book = res.extract('books')[0];
    log.precondition(`Selected existing book: "${book.title}" (id: ${book.id})`);
    return book;
  }
}

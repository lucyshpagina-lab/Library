import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://lucy:password@localhost:5432/library_dev';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchFromGoogleBooks(title: string, author: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`);
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.items || []) {
      const img = item.volumeInfo?.imageLinks;
      if (img?.thumbnail) {
        // Get higher quality image
        return img.thumbnail.replace('zoom=1', 'zoom=2').replace('&edge=curl', '');
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const books = await prisma.book.findMany({
    where: { coverUrl: null },
    select: { id: true, title: true, author: true },
  });

  console.log(`Found ${books.length} books without covers. Fetching from Google Books...`);

  let found = 0;
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const coverUrl = await fetchFromGoogleBooks(book.title, book.author);
    if (coverUrl) {
      await prisma.book.update({ where: { id: book.id }, data: { coverUrl } });
      found++;
      console.log(`  ✓ [${i + 1}/${books.length}] ${book.title}`);
    } else {
      console.log(`  ✗ [${i + 1}/${books.length}] ${book.title}`);
    }
    await delay(200); // rate limit
  }

  console.log(`\nDone! Added covers for ${found}/${books.length} remaining books.`);

  // Check final state
  const stillMissing = await prisma.book.count({ where: { coverUrl: null } });
  const total = await prisma.book.count();
  console.log(`Total: ${total - stillMissing}/${total} books have covers.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

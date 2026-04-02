import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://lucy:password@localhost:5432/library_dev';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Manual fallback queries for stubborn books
const manualQueries: Record<string, string> = {
  'Solaris': 'Solaris Stanislaw Lem novel',
  'It': 'It Stephen King pennywise novel',
  'Mexican Gothic': 'Mexican Gothic Silvia Moreno-Garcia',
  "The Time Traveler's Wife": 'Time Travelers Wife Audrey Niffenegger',
  'The Master and Margarita': 'Master Margarita Bulgakov',
  'The Waste Land and Other Poems': 'Waste Land T.S. Eliot poetry',
  'The Crucible': 'Crucible Arthur Miller play',
  'Becoming': 'Becoming Michelle Obama memoir',
};

async function fetchCover(query: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(query);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`);
    if (!res.ok) return null;
    const data = await res.json();
    for (const item of data.items || []) {
      const img = item.volumeInfo?.imageLinks;
      if (img?.thumbnail) {
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

  console.log(`${books.length} books still without covers:`);

  for (const book of books) {
    const query = manualQueries[book.title] || `${book.title} ${book.author} book`;
    const coverUrl = await fetchCover(query);
    if (coverUrl) {
      await prisma.book.update({ where: { id: book.id }, data: { coverUrl } });
      console.log(`  ✓ ${book.title}`);
    } else {
      console.log(`  ✗ ${book.title}`);
    }
  }

  const stillMissing = await prisma.book.count({ where: { coverUrl: null } });
  const total = await prisma.book.count();
  console.log(`\nFinal: ${total - stillMissing}/${total} books have covers.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

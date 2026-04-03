import path from 'node:path';
import { defineConfig } from 'prisma/config';

const dbUrl = process.env.DATABASE_URL || 'postgresql://lucy:password@localhost:5432/library_dev';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    url: dbUrl,
  },
  datasource: {
    url: dbUrl,
  },
});

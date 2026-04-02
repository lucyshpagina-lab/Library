<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/books_1f4da.png" width="80" alt="Library logo" />
</p>

<h1 align="center">Library</h1>

<p align="center">
  <strong>A modern online library to discover, read, and collect your favorite books</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

---

## Features

| | Feature | Description |
|---|---|---|
| :books: | **200 Books** | Curated collection across 20 genres with real covers from Open Library & Google Books |
| :mag: | **Search & Filter** | Full-text search by title/author, genre filtering, sort by newest/rating/title/author |
| :book: | **Built-in Reader** | Read books directly in the browser with customizable font size, themes, and progress tracking |
| :star: | **Ratings & Comments** | Rate books 1-5 stars and leave comments |
| :heart: | **Favorites** | Save books you love with a live counter in the header |
| :bust_in_silhouette: | **User Profiles** | Register, log in, upload avatar, change username & password |
| :iphone: | **Responsive** | Fully responsive design that works on desktop, tablet, and mobile |
| :open_book: | **Book Details** | Read book, browse table of contents, explore more by the same author |

---

## Book Genres

<table>
<tr>
<td>:rocket: Science Fiction</td>
<td>:crystal_ball: Fantasy</td>
<td>:warning: Dystopia</td>
<td>:ghost: Horror</td>
</tr>
<tr>
<td>:detective: Mystery & Detective</td>
<td>:bomb: Thriller</td>
<td>:heartpulse: Romance</td>
<td>:scroll: Historical Fiction</td>
</tr>
<tr>
<td>:classical_building: Classical Literature</td>
<td>:compass: Adventure</td>
<td>:laughing: Humor</td>
<td>:teddy_bear: Children's Literature</td>
</tr>
<tr>
<td>:feather: Poetry</td>
<td>:performing_arts: Drama</td>
<td>:brain: Psychology & Self-Help</td>
<td>:microscope: Science & Education</td>
</tr>
<tr>
<td>:briefcase: Business</td>
<td>:hourglass_flowing_sand: History</td>
<td>:thought_balloon: Philosophy</td>
<td>:memo: Biography & Memoir</td>
</tr>
</table>

> **10 books per genre** — 200 books total, each with cover art, description, and sample content.

---

## Tech Stack

```
Frontend                Backend                 Database
-----------------       -----------------       -----------------
Next.js 16 (App Router) Express.js              PostgreSQL
React 19               Prisma ORM              
TanStack Query         JWT Authentication      
Zustand                Multer (file uploads)   
Tailwind CSS 4         Zod (validation)        
TypeScript             TypeScript              
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9

### 1. Clone & Install

```bash
git clone https://github.com/lucyshpagina-lab/Library.git
cd Library
npm install
```

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.example .env

# Edit with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/library_dev
# JWT_SECRET=your-secret-key-min-32-chars
```

Create `web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Database Setup

```bash
# Create database
createdb library_dev

# Run migrations
npx prisma migrate deploy

# Seed with 200 books + covers
npx tsx server/prisma/seed.ts
```

### 4. Run

```bash
npm run dev
```

This starts both servers:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

---

## Project Structure

```
Library/
├── server/                    # Express backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── seed.ts            # 200 books seeder
│   │   └── migrations/        # DB migrations
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation, errors
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── lib/               # Prisma client, JWT utils
│   │   └── index.ts           # Server entry point
│   └── uploads/               # User avatar uploads
│
├── web/                       # Next.js frontend
│   └── src/
│       ├── app/               # Pages (App Router)
│       │   ├── page.tsx       # Home (new arrivals + popular)
│       │   ├── catalog/       # Browse & filter books
│       │   ├── book/[id]/     # Book details
│       │   ├── read/[id]/     # Book reader
│       │   ├── favorites/     # Saved books
│       │   ├── login/         # Sign in
│       │   └── register/      # Sign up
│       ├── components/        # Reusable UI components
│       ├── hooks/             # Custom React hooks
│       ├── stores/            # Zustand state stores
│       ├── lib/               # API client, utilities
│       └── types/             # TypeScript interfaces
│
└── package.json               # Monorepo workspace config
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Current user |
| `POST` | `/api/auth/logout` | Sign out |
| `PUT` | `/api/auth/change-password` | Change password |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/books` | List books (search, filter, sort, paginate) |
| `GET` | `/api/books/genres` | List all genres |
| `GET` | `/api/books/:id` | Book details with comments |
| `POST` | `/api/books/:id/comments` | Add comment |
| `POST` | `/api/books/:id/ratings` | Rate book (1-5) |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/profile` | User profile & stats |
| `PUT` | `/api/user/profile` | Update username |
| `POST` | `/api/user/avatar` | Upload avatar |
| `DELETE` | `/api/user/avatar` | Remove avatar |

### Favorites & Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/favorites` | List favorites |
| `POST` | `/api/favorites` | Add favorite |
| `DELETE` | `/api/favorites/:bookId` | Remove favorite |
| `GET` | `/api/progress` | Reading progress |
| `POST` | `/api/progress` | Save reading position |

---

## License

MIT

---

<p align="center">
  Made with :heart: and :books:
</p>

<p align="center">
  <img src="https://em-content.zobj.net/source/apple/391/test-tube_1f9ea.png" width="80" alt="Autotests" />
</p>

<h1 align="center">Library Autotests</h1>

<p align="center">
  <strong>End-to-end test suite for the Library app</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Playwright-1.59-2EAD33?logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Pattern-Page%20Object-blue" alt="Page Object" />
  <img src="https://img.shields.io/badge/Tests-18-brightgreen" alt="18 Tests" />
  <img src="https://img.shields.io/badge/Browser-Chromium-orange?logo=googlechrome&logoColor=white" alt="Chromium" />
</p>

---

## Architecture

```
                    +-----------------+
                    |    Test Specs   |    tests/*.spec.ts
                    |  (5 files, 18)  |    Preconditions + UI assertions
                    +--------+--------+
                             |
              +--------------+--------------+
              |                             |
     +--------v--------+          +--------v--------+
     |   Page Objects   |          |   API Helper    |
     |   pages/*.ts     |          |   helpers/api   |
     |                  |          |                  |
     |  Locators &      |          |  HTTP requests   |
     |  UI actions      |          |  for setup/      |
     |                  |          |  teardown        |
     +--------+---------+          +--------+---------+
              |                             |
              v                             v
     +------------------+          +------------------+
     |  Browser (UI)    |          |  Backend API     |
     |  localhost:3001   |          |  localhost:4000   |
     +------------------+          +------------------+
```

### Test Pattern

Every test follows the same structure:

```
 1. PRECONDITIONS  -->  API requests to set up data
                        (register user, create book, add favorite...)

 2. TEST           -->  UI steps in the browser
                        (navigate, click, fill forms...)

 3. ASSERTION      -->  Verify the API data is reflected in the UI
                        (check text, elements, navigation...)
```

---

## Project Structure

```
autotests/
|
+-- playwright.config.ts        # Playwright configuration & reporter
+-- tsconfig.json                # TypeScript config
+-- package.json                 # Scripts & dependencies
|
+-- helpers/
|   +-- api.ts                   # API helper (fetch-based HTTP client)
|
+-- fixtures/
|   +-- auth.fixture.ts          # Auto-register user + set auth cookie
|
+-- pages/                       # Page Object Model
|   +-- BasePage.ts              # Base class: navigate, header, toast
|   +-- HomePage.ts              # Hero, search, book sections
|   +-- CatalogPage.ts           # Search, sort, genre filter, cards
|   +-- BookPage.ts              # Title, author, read, delete, comments
|   +-- AddBookPage.ts           # Add book form fields & submit
|   +-- LoginPage.ts             # Email, password, oops animation
|   +-- RegisterPage.ts          # Register form with confirm password
|   +-- FavoritesPage.ts         # Empty state, book list, counter
|
+-- tests/                       # Test specifications
|   +-- auth.spec.ts             # 4 tests (register, login, oops, mismatch)
|   +-- catalog.spec.ts          # 4 tests (display, search, sort, default)
|   +-- book-crud.spec.ts        # 3 tests (create API, add UI, delete)
|   +-- book-interactions.spec.ts # 4 tests (comment, rate, read, author)
|   +-- favorites.spec.ts        # 3 tests (empty, add, red heart)
|
+-- report/                      # Generated HTML report (after test run)
    +-- index.html
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- Library app running (both frontend on `:3001` and backend on `:4000`)
- Database seeded with books

### Install

```bash
cd autotests
npm install
npx playwright install chromium
```

### Run Tests

```bash
# All tests
npm test

# With visible browser
npm run test:headed

# Interactive debug mode
npm run test:debug

# Playwright UI mode
npm run test:ui
```

### Run Specific Suites

```bash
npm run test:auth          # Authentication tests
npm run test:catalog       # Catalog browsing tests
npm run test:books         # Book CRUD tests
npm run test:favorites     # Favorites tests
npm run test:interactions  # Book interactions tests
```

### View Report

```bash
npm run report
```

Opens `report/index.html` in your browser with:
- Test results with pass/fail/skip status
- Screenshots on failure
- Video recordings on retry
- Trace viewer for debugging

---

## Test Coverage

### :white_check_mark: auth.spec.ts — Authentication

| # | Test | Preconditions | Verification |
|---|------|---------------|--------------|
| 1 | Register new user | — | Fills form, verifies redirect to home |
| 2 | Login with valid credentials | API: register | Fills login, verifies no error shown |
| 3 | Oops animation on invalid login | — | Wrong creds, verifies oops screen + Try Again |
| 4 | Password mismatch on register | — | Mismatched passwords, verifies error message |

### :white_check_mark: catalog.spec.ts — Catalog Browsing

| # | Test | Preconditions | Verification |
|---|------|---------------|--------------|
| 1 | Display books + genre filter | Seeded DB | Opens catalog, filters by Fantasy, verifies 10 books |
| 2 | Search by title | Seeded DB | Types "Dune", verifies card appears |
| 3 | Sort by author A-Z | Seeded DB | Changes sort, verifies cards reload |
| 4 | Default sort is Newest | — | Opens catalog, verifies select value is "date" |

### :white_check_mark: book-crud.spec.ts — Book CRUD

| # | Test | Preconditions | Verification |
|---|------|---------------|--------------|
| 1 | Create book via API | API: create book | Opens book page, verifies title + author |
| 2 | Add book via UI form | Authenticated | Fills form, submits, verifies redirect to detail |
| 3 | Delete book via API | API: create + delete | Opens deleted book page, verifies "not found" |

### :white_check_mark: book-interactions.spec.ts — Book Interactions

| # | Test | Preconditions | Verification |
|---|------|---------------|--------------|
| 1 | Comment via API | API: add comment | Opens book page, verifies comment text |
| 2 | Rate via API | API: rate 5 stars | Opens book page, verifies rating displayed |
| 3 | Navigate to reader | API: get book ID | Clicks "Read Book", verifies /read URL |
| 4 | Navigate to author books | API: get book | Clicks "Books by Author", verifies catalog |

### :white_check_mark: favorites.spec.ts — Favorites

| # | Test | Preconditions | Verification |
|---|------|---------------|--------------|
| 1 | Empty state | Authenticated, no favs | Verifies broken heart + "is poor since" text |
| 2 | Add favorite via API | API: add favorite | Opens favorites, verifies book card + count |
| 3 | Red heart counter | API: add favorite | Verifies heart icon has red fill class |

---

## Configuration

### Reporter

Configured in `playwright.config.ts`:

```typescript
reporter: [
  ['list'],                                            // Console output
  ['html', { outputFolder: 'report', open: 'never' }], // HTML report
],
```

**Available reporters:** `list`, `dot`, `line`, `html`, `json`, `junit`

Change `open: 'never'` to `open: 'always'` to auto-open report after each run.

### Timeouts

```typescript
timeout: 30000,        // Per-test timeout (30s)
expect: { timeout: 10000 },  // Assertion timeout (10s)
```

### Failure Handling

```typescript
retries: 1,                          // Retry failed tests once
screenshot: 'only-on-failure',       // Capture screenshot on fail
video: 'on-first-retry',             // Record video on retry
trace: 'on-first-retry',             // Collect trace on retry
```

---

## Page Objects

Each page class encapsulates locators and actions for a specific page:

```typescript
// Example: CatalogPage
const catalog = new CatalogPage(page);
await catalog.open();                    // Navigate to /catalog
await catalog.searchFor('Dune');         // Type in search input
await catalog.filterByGenre('Fantasy');  // Click genre button
await catalog.selectSort('author');      // Change sort dropdown
await catalog.clickBook('Dune');         // Click a book card
```

### Inheritance

```
BasePage (navigate, header, toast)
  +-- HomePage
  +-- CatalogPage
  +-- BookPage
  +-- AddBookPage
  +-- LoginPage
  +-- RegisterPage
  +-- FavoritesPage
```

---

## API Helper

Used in preconditions to set up test data without touching the UI:

```typescript
const api = new ApiHelper();
await api.register('user@test.com', 'testuser', 'password');
await api.login('user@test.com', 'password');

const { book } = await api.createBook({ title: '...', ... });
await api.addComment(book.id, 'Great book!');
await api.rateBook(book.id, 5);
await api.addFavorite(book.id);
await api.deleteBook(book.id);
```

---

<p align="center">
  <sub>Built with :test_tube: <a href="https://playwright.dev">Playwright</a> and :heart:</sub>
</p>

# Tasks: Library Project Quality Enhancement

**Input**: [spec.md](./spec.md), [plan.md](./plan.md)  
**Prerequisites**: plan.md (required), spec.md (required)

## Phase 1: Setup

**Purpose**: Install dependencies and prepare tooling infrastructure

- [ ] T001 Install security deps: `npm install helmet express-rate-limit` in `server/`
- [ ] T002 [P] Install tooling deps: `npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier` in root
- [ ] T003 [P] Install pre-commit deps: `npm install -D husky lint-staged` in root

---

## Phase 2: Foundational (Database & Auth)

**Purpose**: Schema changes and core security fixes that other work depends on

- [ ] T004 Add `isAdmin Boolean @default(false)` to User model in `server/prisma/schema.prisma`
- [ ] T005 Add `@@index([userId])` on Comment, Rating, ReadingProgress models in `server/prisma/schema.prisma`
- [ ] T006 Create Prisma migration with raw SQL CHECK constraints: Rating.value (1-5), Book.pageCount (>= 0)
- [ ] T007 Run `npx prisma migrate dev` and verify migration applies cleanly
- [ ] T008 Remove hardcoded JWT fallback in `server/src/lib/jwt.ts` — throw if `JWT_SECRET` is undefined

**Checkpoint**: Database schema updated, JWT secret enforced

---

## Phase 3: User Story 1 — Secure API & Auth Hardening (P1)

**Goal**: All API endpoints are protected with rate limiting, security headers, authorization, and body size limits.

**Independent Test**: Run security-focused E2E tests against the API.

### Implementation

- [ ] T009 [US1] Add `helmet()` middleware in `server/src/index.ts` (before routes)
- [ ] T010 [US1] Set `express.json({ limit: '1mb' })` in `server/src/index.ts`
- [ ] T011 [US1] Create rate limiter middleware in `server/src/middleware/rateLimiter.ts` (10 req/min for auth routes)
- [ ] T012 [US1] Apply rate limiter to `/api/auth/*` routes in `server/src/routes/auth.routes.ts`
- [ ] T013 [US1] Add authorization check to `deleteBook` in `server/src/controllers/books.controller.ts` — require admin or owner
- [ ] T014 [US1] Add authorization check to `createBook` in `server/src/controllers/books.controller.ts` — require admin
- [ ] T015 [US1] Verify Multer file size limit is set (5MB cap) in `server/src/routes/user.routes.ts`

**Checkpoint**: API security hardened — test with brute-force login attempt and unauthorized delete

---

## Phase 4: User Story 2 — Database Performance & Integrity (P2)

**Goal**: Queries are fast via indexes, invalid data is rejected by constraints.

**Independent Test**: Insert invalid rating, verify rejection; query by userId and confirm index usage.

### Implementation

- [ ] T016 [US2] Verify indexes applied correctly by running `EXPLAIN ANALYZE` on userId queries
- [ ] T017 [US2] Test CHECK constraint: attempt to insert rating=0 and rating=6, confirm rejection
- [ ] T018 [US2] Test CHECK constraint: attempt to insert book with pageCount=-1, confirm rejection
- [ ] T019 [US2] Update Zod validation schemas to match DB constraints (rating 1-5, pageCount >= 0) in server controllers

**Checkpoint**: Database constraints and indexes verified

---

## Phase 5: User Story 3 — Frontend Accessibility & Error Handling (P2)

**Goal**: All images have meaningful alt text, errors are handled gracefully, toasts auto-dismiss.

**Independent Test**: Screen reader audit + trigger a component error to test boundary.

### Implementation

- [ ] T020 [P] [US3] Fix alt text in `web/src/components/books/BookCard.tsx` — use book title
- [ ] T021 [P] [US3] Audit and fix alt text on all other `<img>` tags across `web/src/`
- [ ] T022 [US3] Create root error boundary at `web/src/app/error.tsx` with fallback UI and retry button
- [ ] T023 [US3] Add auto-dismiss to toast store in `web/src/stores/toastStore.ts` (5s timeout)

**Checkpoint**: Run accessibility audit, trigger errors — all handled gracefully

---

## Phase 6: User Story 4 — Code Quality Tooling (P3)

**Goal**: ESLint, Prettier, and pre-commit hooks enforce code quality automatically.

**Independent Test**: Stage a file with lint errors, attempt commit — should be blocked.

### Implementation

- [ ] T024 [US4] Create `.eslintrc.js` config at project root (TypeScript + React rules)
- [ ] T025 [P] [US4] Create `.prettierrc` config at project root
- [ ] T026 [US4] Add ESLint and Prettier scripts to root `package.json` (`lint`, `lint:fix`, `format`)
- [ ] T027 [US4] Run `eslint --fix` on entire codebase to auto-fix existing issues
- [ ] T028 [US4] Initialize husky: `npx husky init` and create `.husky/pre-commit`
- [ ] T029 [US4] Configure lint-staged in `package.json` to run ESLint + Prettier on staged files
- [ ] T030 [US4] Verify pre-commit hook blocks commits with lint errors

**Checkpoint**: Commit with lint error is blocked; clean commit passes

---

## Phase 7: Polish & Validation

**Purpose**: Final validation across all quality improvements

- [ ] T031 Update `.env.example` with `JWT_SECRET` requirement and documentation
- [ ] T032 Run full Playwright E2E test suite to verify no regressions
- [ ] T033 Update README.md with new setup requirements (JWT_SECRET, lint commands)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (server deps)
- **Phase 3 (Security)**: Depends on Phase 2 (isAdmin field needed for authorization)
- **Phase 4 (Database)**: Depends on Phase 2 (indexes/constraints from migration)
- **Phase 5 (Frontend)**: No dependency on Phase 2 — can run in parallel with Phase 3/4
- **Phase 6 (Tooling)**: No dependency on other phases — can run in parallel
- **Phase 7 (Polish)**: Depends on all previous phases

### Parallel Opportunities

```
Phase 1 (Setup)
    └── Phase 2 (Foundational)
            ├── Phase 3 (Security)     ──┐
            └── Phase 4 (DB Validation) ──┼── Phase 7 (Polish)
        Phase 5 (Frontend) ───────────────┤
        Phase 6 (Tooling) ────────────────┘
```

Phases 5 and 6 can start in parallel with Phase 2 since they don't depend on DB changes.

---

## Notes

- [P] tasks = different files, no dependencies — can run in parallel
- [US#] label maps task to user story
- Commit after each task or logical group
- Run `npx prisma migrate dev` only once (T007) for all schema changes (T004-T006)
- ESLint auto-fix (T027) may produce a large diff — commit separately

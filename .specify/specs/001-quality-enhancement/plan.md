# Implementation Plan: Library Project Quality Enhancement

**Branch**: `001-quality-enhancement` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)

## Summary

Harden the Library application across security, database performance, frontend resilience, and developer tooling. All changes are additive/non-breaking within the existing Next.js 16 + Express + Prisma + PostgreSQL stack.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js)  
**Primary Dependencies**: Next.js 16, React 19, Express.js, Prisma ORM, Playwright  
**Storage**: PostgreSQL via Prisma  
**Testing**: Playwright E2E (existing), ESLint (to add)  
**Target Platform**: Linux server + web browser  
**Project Type**: Web application (monorepo: server/ + web/)  
**Constraints**: No breaking API changes, no new runtime dependencies beyond security/quality tooling

## Project Structure

### Source Code (repository root)

```text
server/
├── src/
│   ├── controllers/     # Authorization fixes (books.controller.ts)
│   ├── middleware/       # Rate limiter, error handler improvements
│   ├── lib/             # JWT secret validation (jwt.ts)
│   └── index.ts         # Helmet, body-parser limits
├── prisma/
│   └── schema.prisma    # Indexes, constraints
└── package.json         # New deps: helmet, express-rate-limit

web/
├── src/
│   ├── components/      # Alt text fixes (BookCard.tsx)
│   ├── app/             # Error boundaries (error.tsx files)
│   └── stores/          # Toast auto-dismiss (toastStore.ts)
└── package.json         # ESLint, Prettier deps

root/
├── package.json         # Husky, lint-staged
├── .eslintrc.js         # Shared ESLint config
├── .prettierrc          # Shared Prettier config
└── .husky/pre-commit    # Pre-commit hook
```

## Changes by Area

### A. Security Hardening (server/)

1. **JWT Secret Validation** (`server/src/lib/jwt.ts`)
   - Remove hardcoded fallback `'dev-secret-change-me'`
   - Throw error on startup if `JWT_SECRET` is undefined

2. **Rate Limiting** (`server/src/middleware/rateLimiter.ts` — new file)
   - Add `express-rate-limit` dependency
   - Apply to `/api/auth/*` routes: 10 requests per minute per IP

3. **Security Headers** (`server/src/index.ts`)
   - Add `helmet` dependency
   - Apply `helmet()` middleware before routes

4. **Body Size Limits** (`server/src/index.ts`)
   - Set `express.json({ limit: '1mb' })`
   - Multer file size already configured — verify 5MB cap

5. **Authorization Checks** (`server/src/controllers/books.controller.ts`)
   - `createBook`: Require admin role
   - `deleteBook`: Require admin role or book owner

### B. Database Improvements (server/prisma/)

6. **Add Indexes** (`schema.prisma`)
   - `@@index([userId])` on Comment, Rating, ReadingProgress models

7. **Add Constraints** (Prisma migration)
   - Rating value: CHECK (value >= 1 AND value <= 5)
   - Book pageCount: CHECK (pageCount >= 0)
   - Note: Prisma doesn't natively support CHECK — use raw SQL in migration

8. **User Admin Flag** (`schema.prisma`)
   - Add `isAdmin Boolean @default(false)` to User model

### C. Frontend Improvements (web/)

9. **Accessible Alt Text** (`web/src/components/books/BookCard.tsx`)
   - Change `alt=""` to `alt={book.title}` or `alt={\`Cover of ${book.title}\`}`

10. **Error Boundaries** (`web/src/app/error.tsx`, per-route `error.tsx`)
    - Add root error boundary with "Something went wrong" fallback + retry button

11. **Toast Auto-Dismiss** (`web/src/stores/toastStore.ts`)
    - Add `setTimeout` to auto-remove toasts after 5 seconds

### D. Developer Tooling (root)

12. **ESLint + Prettier** (root `package.json`, config files)
    - Install: `eslint`, `prettier`, `@typescript-eslint/*`, `eslint-config-prettier`
    - Configure for both server/ and web/ workspaces

13. **Pre-commit Hooks** (root `package.json`)
    - Install: `husky`, `lint-staged`
    - Configure: run ESLint + Prettier on staged `.ts`, `.tsx` files

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| JWT secret validation | Server won't start without env var | Document in README, update .env.example |
| Rate limiting | May block legitimate rapid requests | Use sensible limits (10/min), skip in test env |
| Database migration | Schema changes on production DB | Run migration in maintenance window |
| CHECK constraints | Existing bad data may violate constraints | Audit and fix data before migration |
| ESLint on existing code | Many existing violations | Apply `--fix` first, suppress remaining with TODO comments |

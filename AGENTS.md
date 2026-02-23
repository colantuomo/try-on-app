# AGENTS — Virtual Try-On App

> This document defines the implementation rules, architecture patterns, libraries, and coding standards for the project.
> It is the authoritative guide for AI agents and human contributors.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Architecture](#2-project-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Coding Standards](#4-coding-standards)
5. [Security Rules](#5-security-rules)
6. [API Design Patterns](#6-api-design-patterns)
7. [Database & Data Layer](#7-database--data-layer)
8. [Authentication](#8-authentication)
9. [Frontend Patterns](#9-frontend-patterns)
10. [Error Handling](#10-error-handling)
11. [Logging](#11-logging)
12. [Testing](#12-testing)
13. [Environment & Configuration](#13-environment--configuration)
14. [Git & Deployment](#14-git--deployment)
15. [DDD Boundaries](#15-ddd-boundaries)
16. [Current Routes](#16-current-routes)

---

## 1. Tech Stack

### Core

| Category         | Tool / Library                | Purpose                              |
| ---------------- | ----------------------------- | ------------------------------------ |
| Framework        | **Next.js 16** (App Router)   | Full-stack React framework           |
| Language         | **TypeScript** (strict mode)  | Type safety across the project       |
| Styling          | **Tailwind CSS 3**            | Utility-first styling                |
| Database         | **PostgreSQL**                | Relational database                  |
| ORM              | **Prisma**                    | Type-safe DB access and migrations   |
| Auth             | **NextAuth.js (Auth.js)**     | Authentication and session management|
| Payments         | **Stripe**                    | Subscription billing and checkout    |
| AI - Try-On      | **Google Gemini SDK** / **Replicate** | Image generation for virtual try-on |
| Image Processing | **Sharp**                     | Server-side image manipulation       |
| State Management | **Zustand**                   | Lightweight global state on frontend |

### Requirements

- **Node.js**: 24.13.1+ (Prisma 7 needs 20.19+)
- **TypeScript**: 5.4.0+ (strict mode required)
- **React**: 18.2.0+

### Absolute Requirements (No Exceptions)

- ✅ **Strict TypeScript** - No `any`, use `unknown` with type guards
- ✅ **Use `const` by default** - `let` only when reassignment needed
- ✅ **Named exports** for utilities/services - Exception: Next.js pages/layouts (default export required)
- ✅ **All DB access via `lib/services/`** - Never import Prisma directly in routes
- ✅ **No client-side secrets** - Never use `NEXT_PUBLIC_` for sensitive keys
- ✅ **No raw SQL** - Always use Prisma ORM
- ❌ **No environment-specific hacks** - Use feature flags instead

---

## 2. Project Architecture

The project follows a **modular architecture** with clear separation of concerns. DDD (Domain-Driven Design) concepts are applied **where they add value** — mainly in domain entities, value objects, and service boundaries — without over-engineering with aggregates, repositories for simple CRUD, or excessive abstraction.

### Principles

| Principle     | How it's Applied                                                                 |
| ------------- | -------------------------------------------------------------------------------- |
| **DRY**       | Extract shared logic into `lib/`. Reuse types, validators, and service functions.|
| **SRP**       | Each file/module has one clear responsibility.                                   |
| **Modularity**| Features are self-contained. A module can be removed without breaking others.    |
| **Colocation**| Keep related files close: types + service + route in the same feature scope.     |
| **Explicit**  | No magic. Prefer verbose clarity over clever shortcuts.                          |

### Layer Responsibilities

Layer responsibilities follow presentation → application → infrastructure → cross-cutting separation as outlined in the folder structure.

---

## 3. Folder Structure

Use the folder layout described in this document; keep feature logic in lib/services and validation in lib/validators.

### Current App Router Groups

- `app/(public)` for public pages (landing, login, pricing)
- `app/(private)` for authenticated pages (dashboard, billing, checkout, try-on)
- `app/api` for route handlers

### Naming Conventions

| Element              | Convention                         | Example                          |
| -------------------- | ---------------------------------- | -------------------------------- |
| Files (components)   | PascalCase                         | `TryOnForm.tsx`                  |
| Files (logic)        | kebab-case or dot notation         | `try-on.service.ts`              |
| Files (types)        | kebab-case                         | `try-on.ts`                      |
| Directories          | kebab-case                         | `lib/services/`                  |
| React components     | PascalCase                         | `ImagePreview`                   |
| Functions            | camelCase                          | `generateTryOn()`                |
| Constants            | UPPER_SNAKE_CASE                   | `MAX_FILE_SIZE`                  |
| Types / Interfaces   | PascalCase                         | `TryOnRequest`                   |
| Env variables        | UPPER_SNAKE_CASE                   | `DATABASE_URL`                   |
| CSS classes          | Tailwind utilities (no custom BEM) | `className="flex items-center"`  |

---

## 4. Coding Standards

### Language

- **All code in English**: variable names, function names, type names, comments, commit messages.
- **User-facing text** (UI labels, error messages shown to users): can be in Portuguese (pt-BR) since the app targets Brazilian users.

### TypeScript Rules

- **Strict mode always** (`"strict": true`)
- **Return types on all public functions**
- **Use `interface` for extensible object shapes, `type` for unions**
- **`readonly` on immutable properties**
- **Discriminated unions for state** (never use boolean flags)

### Function & File Design

- **Max 30 lines/function** - breaks into smaller functions if growing
- **Max 3 parameters** - use options object for more
- **Pure functions** - no side effects in utils
- **Early returns** - avoid nested if/else
- **Max ~200 lines/file** - split by responsibility
- **Extract hooks** when component logic grows

### Comments

- **Explain WHY, not WHAT** - code shows what
- Use `// TODO: context` and `// SECURITY: reason` sparingly

---

## 5. Security Rules

### Secrets & Environment Variables

- **Never commit `.env`** - only `.env.example` (empty values)
- **Never use `NEXT_PUBLIC_`** for sensitive data
- **Validate all env vars at startup** - fail fast if missing
- **Log only last 4 chars** of secrets if logging needed

### Input Validation

- **Validate ALL external inputs** at route handler level (never trust client)
- TypeScript type narrowing + custom validation functions
- Check: type, format, length, allowed values
- Fail early with 400 status

### API Security

- **Authenticate** all protected routes (check session first)
- **Rate limit** expensive operations (AI generation, payments)
- **Validate Content-Type** - reject unexpected headers
- **Limit request size** - config in `next.config.js`
- **Sanitize uploads** - MIME type, file size, dimensions
- **Verify Stripe webhooks** with `stripe.webhooks.constructEvent()`
- **Never log secrets** - only last 4 chars if needed
- **Principle of least privilege** - minimal access per service

---

## 6. API Design Patterns

### Route Handler Pattern

```typescript
// app/api/route.ts
export async function POST(req: NextRequest) {
  // 1. Authenticate (get session)
  // 2. Validate input
  // 3. Call service
  // 4. Return response or error
}
```

**Pattern**: Thin handler → Validate → Service → Response

- **Business logic in `lib/services/`**, not routes
- **Error format**: `{ error: string }` with HTTP status
- **No try/catch in services** - let errors propagate to route handler

### Standard HTTP Status Codes

| Code | When to Use                                             |
| ---- | ------------------------------------------------------- |
| 200  | Successful read or update                               |
| 201  | Successful resource creation                            |
| 400  | Invalid input / validation error                        |
| 401  | Missing or invalid authentication                       |
| 403  | Authenticated but not authorized (e.g., plan limit)     |
| 404  | Resource not found                                      |
| 409  | Conflict (e.g., duplicate resource)                     |
| 422  | Semantically invalid (e.g., AI safety block)            |
| 429  | Rate limit exceeded                                     |
| 500  | Internal server error (unexpected failure)              |

---

## 7. Database & Data Layer

### Prisma 7 Setup

- **Version**: 7.4.0+ only
- **Schema**: `prisma/schema.prisma` (PostgreSQL)
- **Client**: `db/client.ts` - global singleton with Accelerate extension
- **Generator**: `provider = "prisma-client"` with `output = "../app/generated/prisma"`
- **Import**: `from '../app/generated/prisma/client'` (include `/client`)
- **Config**: `prisma.config.ts` with `import 'dotenv/config'`

### Schema Guidelines

- **Timestamps**: `createdAt` and `updatedAt` on every model
- **Primary key**: `@id @default(cuid())` (safer than auto-increment)
- **Indexes**: On foreign keys and query fields (`userId`, `email`)
- **Enums**: For plan types, statuses (not strings)
- **Relations**: Always use formal relations, never raw IDs
- **Cascade deletes**: `@relation(..., onDelete: Cascade)`

**Plan enum**: FREE (default), TRIAL, STARTER, PRO, BUSINESS

### Usage Plans & Credits (CRITICAL)

**Consumption order**: Monthly quota → Credits → Block

**Hard limits** (per month):
- FREE: 0 images
- TRIAL: 10 total
- STARTER: 100
- PRO: 1,000
- BUSINESS: 3,000

**Backend rules** (non-negotiable):
- ✅ Validate balance BEFORE generation
- ❌ Never allow negative balance
- ❌ Never debit after generation fails
- ❌ Never trust frontend numbers

### Data Access

- **Never import Prisma directly** in routes/components → use `lib/services/`
- **Never return raw database types** in API responses → map to response types

---

## 8. Authentication

### NextAuth.js Configuration

- **Config**: `lib/auth/options.ts` (secret, adapter, providers, callbacks)
- **Route**: `app/api/auth/[...nextauth]/route.ts`
- **Strategy**: JWT (stateless, good for serverless)
- **Provider**: Google OAuth (extensible)
- **Adapter**: PrismaAdapter for session storage
- **Callbacks**: Map `user.id` → `token.sub` → `session.user.id`

### Auth Patterns

- **Server**: `getServerSession(authOptions)` in routes & server components
- **Client**: `useSession()` + `SessionProvider`
- **Route protection**: Guard with `requireAuthSession()` utility

---

## 9. Frontend Patterns

### Component Organization

- **Server components by default** - add `'use client'` only for interactivity/hooks
- **Small, focused** - one responsibility per component
- **Extract hooks** - `useXxx.ts` for complex logic

### State Management

- **Zustand** for global UI state (user prefs, theme)
- **Server state** via fetch/SWR/React Query
- **Never localStorage** for secrets - use httpOnly cookies (NextAuth handles)

### Frontend Security

- **Sanitize content** - avoid `dangerouslySetInnerHTML`
- **Use `<Image>`** from next/image - optimization + security

---

## 10. Error Handling

### Error Handling

- **Typed domain errors** for business rules
- **Map to HTTP responses** with status codes
- **Centralized handler** in routes for consistency

---

## 11. Logging

Use structured `console.log` with consistent prefixes for easy filtering in production logs (Vercel aggregates stdout).

### Logging Rules

- **Format**: `[Module] message` (searchable in Vercel logs)
- **Never log**: secrets, tokens, passwords, full user data
- **Log**: action boundaries, identifiers (`userId`)
- **Levels**: `error` (failures), `warn` (degraded), `log` (info)

---

## 12. Testing

### Testing (Vitest + Testing Library)

**Test layers**:
- **Services**: Logic, edge cases, errors
- **Validators**: Valid/invalid combos
- **Utils**: Pure functions
- **API Routes**: Contract, auth checks
- **Components**: Interactions, rendering

**Rules**:
- **Skip trivial code** - getters/setters
- **Mock externals** - Gemini, Stripe (never call real APIs)
- **Isolated tests** - no shared state
- **Test behavior** - not implementation

---

## 13. Environment & Configuration

### Environment Variables

- **Keep `.env.example`** updated with every new var
- **Validate at startup** - fail fast if missing
- **Use `NEXT_PUBLIC_`** only for public values

---

## 14. Git & Deployment

### Git Workflow

**Branches**: `main` → prod | `develop` → features | `feat/*` → work

**Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/)
```
feat: feature name
fix: bug name
refactor: code change
docs: doc update
test: test addition
```

### Deployment (Vercel)

- `main` → production
- `develop` → preview
- **Env vars in Vercel dashboard** - never in code

### Pre-deploy

- ✅ Build passes: `npm run build`
- ✅ Lint passes: `npm run lint`
- ✅ Tests pass: `npm test`
- ✅ Migrations applied
- ✅ `.env.example` updated
- ✅ No debug `console.log`

---

## 15. DDD Boundaries

DDD is applied **pragmatically**, not dogmatically. Use these patterns where they reduce complexity:

### DDD (Pragmatic)

**Use when it adds value**:
- Domain types (`TryOnRequest`, `Plan`)
- Value objects (`EmailAddress`, `ImageInput`)
- Services for orchestration
- Typed domain errors

**Don't use**:
- Simple CRUD repositories
- Aggregate roots (overkill)
- Event sourcing
- Complex domain events

---

## Quick Reference

| Topic      | Rule |
|-----------|------|
| **Code** | All English. Strict TS. Named exports. |
| **Functions** | Max 30 lines. Max 3 params. Early returns. |
| **Files** | Max ~200 lines. Single responsibility. |
| **Secrets** | Never client-side. Never log. |
| **API Routes** | Thin → validate → service → response |
| **Database** | Prisma 7 only. Via services. |
| **Auth** | JWT + Google OAuth. Prisma adapter. |
| **Plans** | Hard limits. Quota → credits → block. |
| **State** | Zustand UI only. Server state via fetch. |
| **Testing** | Vitest + Testing Lib. Mock externals. |
| **Git** | Conventional commits. `main` prod / `develop` dev. |
| **DDD** | Types, services, errors — yes. Repos, aggregates — no. |

---

## 16. Current Routes

### Public

- `/` → landing page
- `/login`
- `/pricing`

### Private

- `/dashboard`
- `/billing`
- `/checkout`
- `/try-on`

### API

- `/api/auth/[...nextauth]`
- `/api/try-on`
- `/api/usage` - GET: Get user credits and plan info
- `/api/stripe/checkout` - POST: Create Stripe checkout session
- `/api/stripe/webhook` - POST: Handle Stripe webhook events


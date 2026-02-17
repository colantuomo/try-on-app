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

- **Node.js**: 20.9.0+ (LTS)
- **TypeScript**: 5.1.0+
- **React**: 18.2.0+ or 19.0.0+

### What's New in Next.js 16

- **Turbopack by default**: Faster builds and development server
- **React 19 support**: Latest React features including View Transitions and useEffectEvent
- **Async Request APIs**: `cookies`, `headers`, `params`, `searchParams` are now async
- **Enhanced caching**: New `updateTag()` and improved `revalidateTag()` APIs
- **React Compiler support**: Automatic component memoization (opt-in)
- **Improved performance**: Better routing, navigation, and build optimizations

### What NOT to Use

- **No `any` type** — always type explicitly or use `unknown` with type guards.
- **No `var`** — use `const` by default, `let` only when reassignment is needed.
- **No default exports** for utilities/components — use named exports (exception: Next.js pages and layouts which require default exports).
- **No direct `fetch` for external APIs** — wrap in service functions inside `lib/services/`.
- **No client-side secrets** — never prefix sensitive keys with `NEXT_PUBLIC_`.
- **No inline SQL** — always use Prisma ORM.
- **No `eval()`, `Function()`, or dynamic code execution.**

---

## Migration to Next.js 16

### From Next.js 14/15

The project has been successfully upgraded to Next.js 16.1.6. Key changes:

#### Automatic Updates Applied

- **JSX Runtime**: Updated from `jsx: "preserve"` to `jsx: "react-jsx"` (React automatic runtime)
- **TypeScript includes**: Added `.next/dev/types/**/*.ts` for better type checking
- **Turbopack**: Now used by default for faster development builds

#### Breaking Changes (Not Applicable to Current Project)

The current codebase doesn't use any of the breaking change APIs:

- **Async Request APIs**: `cookies()`, `headers()`, `params`, `searchParams` - not used in current routes
- **Image component changes**: Local images with query strings - not implemented yet
- **Middleware → Proxy**: No middleware files in the project
- **Runtime configuration**: Not using deprecated `serverRuntimeConfig`/`publicRuntimeConfig`

#### Performance Improvements

- **Faster builds**: Turbopack provides significantly faster compilation
- **Better HMR**: Improved hot module replacement during development
- **Optimized routing**: Enhanced navigation and prefetching
- **Concurrent dev/build**: Can run `next dev` and `next build` simultaneously

### Node.js Version Requirement

Next.js 16 requires **Node.js 20.9.0+**. Update your development environment:

Keep local Node.js at 20.9+ (LTS) using your preferred version manager.

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

Prefer explicit types and named exports for utilities and shared logic.

- Always use **strict TypeScript** (`"strict": true` in tsconfig).
- Define **return types** for all public functions.
- Use **interfaces** for object shapes that can be extended; use **types** for unions, intersections, and mapped types.
- Prefer **`readonly`** for properties that should not be mutated.
- Use **discriminated unions** for state modeling (avoid boolean flags).

Use discriminated unions for state modeling instead of boolean flags.

### Function Design

- **Max 30 lines per function** (soft limit). If a function grows beyond this, break it down.
- **Max 3 parameters**. If more are needed, use an options object.
- **No side effects in utility functions** — keep them pure.
- **Early returns** over nested if/else chains.

Use early returns and keep validation logic concise.

### File Length

- **Max ~200 lines per file** (soft limit). If growing beyond, split by responsibility.
- If a component has complex logic, extract it into a custom hook (`useXxx.ts`).

### Comments

- Write comments that explain **why**, not **what** (the code should explain what).
- Use `// TODO:` for known incomplete items. Always include context.
- Use `// IMPORTANT:` or `// SECURITY:` for critical notes.

Use TODO comments sparingly with context; reserve SECURITY comments for critical notes.

---

## 5. Security Rules

### Secrets & Environment Variables

- **Never commit `.env` files** — only `.env.example` with empty placeholders.
- **Never expose server secrets to the client** — only `NEXT_PUBLIC_*` vars reach the browser.
- **Validate all env vars at startup** — fail fast if required vars are missing.

Validate all required environment variables at startup and fail fast if missing.

### Input Validation

- **Validate ALL external inputs** at the API route handler level — never trust the client.
- Use TypeScript type narrowing and custom validation functions.
- Validate types, formats, length limits, and allowed values.

Validate all external inputs in route handlers before calling services.

### API Security

- **Authenticate all protected routes** — check session before processing.
- **Rate limit API endpoints** — especially AI generation routes (expensive operations).
- **Validate content types** — reject unexpected Content-Type headers.
- **Limit request body size** — configure in `next.config.js` or at the route level.
- **Sanitize file uploads** — validate MIME type, file size, and dimensions.
- **Set security headers** via `next.config.js`:

Set standard security headers in Next.js configuration.

### Stripe Webhook Security

- **Always verify webhook signatures** using `stripe.webhooks.constructEvent()`.
- **Never process unverified webhook payloads.**

### Data Protection

- **Never log full API keys, tokens, or credentials.** Log only last 4 characters if needed.
- **Never store passwords in plain text** — NextAuth handles this, but if custom: always hash with bcrypt.
- **Apply the principle of least privilege** — each service/function should only access what it needs.

---

## 6. API Design Patterns

### Route Handler Structure

Every API route should follow this standard structure:

Route handlers must remain thin: authenticate, validate input, delegate to services, then respond.

### Principles

- **Route handlers are thin** — they only wire authentication, validation, and response formatting. Business logic lives in `lib/services/`.
- **Consistent error responses** — always return `{ error: string }` for errors with appropriate HTTP status codes.
- **No try/catch at the service level unless recovering from a known error** — let unexpected errors propagate to a centralized error handler in the route.

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

### Prisma Setup

- **Schema files**:
	- `prisma/schema.prisma` (SQLite for local/dev)
	- `prisma/schema.prisma` (PostgreSQL for production)
- **Singleton client**: `db/client.ts` — prevents multiple Prisma instances in development.
- **Local tests**: SQLite is allowed until PostgreSQL is provisioned.

Use a singleton Prisma client in development to avoid hot-reload connection leaks.

### Schema Guidelines

- Always define `createdAt` and `updatedAt` on every model.
- Use **`@id` with `cuid()`** for primary keys (not auto-increment integers — safer for public APIs).
- Add **database indexes** on fields used in frequent queries (e.g., `userId`, `email`).
- Use **enums** for fixed sets of values (e.g., plan types, status fields).
- Use **relations** instead of storing raw IDs without a formal relation.

Define user plans as FREE, TRIAL, STARTER, PRO, and BUSINESS with FREE as default.
If the user has no active plan, keep them on FREE.

### Usage Plans and Credits (Critical)

The system enforces hard limits for image generation. Always consume in this order:

1. Monthly plan quota
2. Additional credits (if any)
3. Block generation

Never allow negative balance and never debit after generation.

Recommended data model (simplified):

Track monthly usage with period boundaries and store expiring credit packs for add-on credits.

Plan limits (hard caps):

- FREE: 0 images (requires upgrade) or a minimal sandbox quota if enabled
- TRIAL: 10 images total, single purchase, no renewal
- STARTER: 100 images per month
- PRO: 1,000 images per month
- BUSINESS: 3,000 images per month

Additional credits:

- Only consumed after monthly quota
- Expire after 30-60 days
- Do not auto-renew

Backend rules (non-negotiable):

- Never generate without balance
- Never allow negative balance
- Always validate and debit before generation
- Never trust frontend

### Data Access

- **Never import Prisma client directly in route handlers or components.** Always go through a service function in `lib/services/`.
- **Never expose raw database types to the API response.** Map to response types explicitly.

---

## 8. Authentication

### NextAuth.js Configuration

- Config file: `lib/auth/options.ts`
- Route handler: `app/api/auth/[...nextauth]/route.ts`
- Use **JWT strategy** (stateless, works well with Vercel/edge).
- Configure **providers**: Google OAuth at minimum, expandable later.

Auth.js must use Google OAuth and store sessions via Prisma adapter, with session user id mapped in callbacks.

### Auth Patterns

- **Server-side**: Use `getServerSession(authOptions)` in API routes and Server Components.
- **Client-side**: Use `useSession()` from `next-auth/react` wrapped in a `SessionProvider`.
- **Middleware protection**: Use Next.js middleware for route-level protection if needed.

---

## 9. Frontend Patterns

### Component Organization

- **Server Components by default** — only add `'use client'` when you need interactivity, browser APIs, or hooks.
- **Small, focused components** — each component does ONE thing.
- **Extract logic into custom hooks** — `useXxx.ts` files next to the component or in a `hooks/` folder.

Prefer colocated component + hook + test structure for complex features.

### State Management with Zustand

Use Zustand for global state that multiple components need (e.g., user preferences, UI state). Avoid it for server state — use React's built-in data fetching or SWR/React Query for that.

Use Zustand only for shared UI state that multiple components need.

### Frontend Security

- **Never store sensitive tokens in localStorage** — use httpOnly cookies (handled by NextAuth).
- **Sanitize user-generated content** before rendering — avoid `dangerouslySetInnerHTML`.
- **Use `<Image>` from `next/image`** for all images — handles optimization and prevents common image attacks.

---

## 10. Error Handling

### Custom Error Classes

Define clear, typed errors for different failure scenarios:

Use typed domain errors and map them to consistent HTTP responses.

### Error Handling in API Routes

Keep a centralized API error handler for consistent responses.

---

## 11. Logging

Use structured `console.log` with consistent prefixes for easy filtering in production logs (Vercel aggregates stdout).

### Standards

Use structured logs with a module prefix, and never log sensitive data.

### Rules

- **Always use a `[Module]` prefix** for log context.
- **Never log sensitive data**: API keys, tokens, passwords, full request bodies with personal data.
- **Log action boundaries**: entry/exit of important operations (generation started/completed).
- **Include identifiers**: `userId`, `requestId`, etc., for tracing.
- Use `console.error` only for actual errors, `console.warn` for degraded states, `console.log` for informational events.

---

## 12. Testing

### Framework: Vitest + Testing Library

Use Vitest + Testing Library for unit and component tests with jsdom.

### What to Test

| Layer           | What to Test                                      | Tool                  |
| --------------- | ------------------------------------------------- | --------------------- |
| Services        | Business logic, edge cases, error paths           | Vitest                |
| Validators      | Valid/invalid input combinations                   | Vitest                |
| Utils           | Pure functions, formatting, calculations           | Vitest                |
| API Routes      | Request/response contract, auth checks             | Vitest + mock request |
| Components      | User interactions, conditional rendering           | Testing Library       |

### Test Naming

Name tests by behavior and expected outcome.

### Rules

- **No tests for trivial getters/setters.** Test logic, not plumbing.
- **Mock external services** (Gemini, Replicate, Stripe) — never call real APIs in tests.
- **Keep tests isolated** — no shared mutable state between tests.
- **Test the contract, not the implementation** — assertions should verify outputs and side effects, not internal method calls.

---

## 13. Environment & Configuration

### Required Environment Variables

Document required environment variables in .env.example without sensitive values.

### Rules

- Keep `.env.example` updated whenever a new env var is added.
- Validate all required vars at app startup (see section 5).
- Use `NEXT_PUBLIC_` prefix ONLY for values safe to expose to the browser.

---

## 14. Git & Deployment

### Branch Strategy

| Branch      | Purpose                            |
| ----------- | ---------------------------------- |
| `main`      | Production-ready code              |
| `develop`   | Integration branch for features    |
| `feat/*`    | New feature development            |
| `fix/*`     | Bug fixes                          |
| `refactor/*`| Code refactoring (no behavior change) |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add usage tracking service
fix: prevent duplicate Stripe webhook processing
refactor: extract image validation into shared utility
docs: update env configuration in AGENTS.md
test: add unit tests for billing service
chore: update Prisma to v5.x
```

### Deployment (Vercel)

- Push to `main` triggers production deployment.
- Push to `develop` triggers preview deployment.
- Environment variables configured in Vercel dashboard — **never in code**.
- Use Vercel's built-in analytics and serverless function logs for monitoring.

### Pre-deploy Checklist

- [ ] `npm run build` passes without errors.
- [ ] `npm run lint` passes without warnings.
- [ ] All tests pass (`npm test`).
- [ ] No `console.log` for debugging left in production code (use structured logs only).
- [ ] `.env.example` is up to date.
- [ ] Prisma migrations are committed and applied.

---

## 15. DDD Boundaries

DDD is applied **pragmatically**, not dogmatically. Use these patterns where they reduce complexity:

### Where DDD Adds Value

| Pattern            | Where to Use                                          | Example                                   |
| ------------------ | ----------------------------------------------------- | ----------------------------------------- |
| **Domain Types**   | Represent core business concepts with explicit types   | `TryOnRequest`, `UsageLimit`, `Plan`      |
| **Value Objects**  | Encapsulate specific validated values                  | `EmailAddress`, `ImageInput`              |
| **Services**       | Orchestrate multi-step operations                      | `TryOnService.generate()`                 |
| **Domain Errors**  | Typed errors for business rule violations              | `UsageLimitExceededError`                 |

### Where NOT to Use DDD

- **Simple CRUD** — don't create Repository + Service + Entity for basic user settings.
- **No Aggregate Roots** — the app is not complex enough to need aggregate boundaries.
- **No Event Sourcing** — standard CRUD with Prisma is appropriate.
- **No Complex Domain Events** — use simple function calls between services.

### Example: Service with Domain Logic

Use services to orchestrate domain rules (usage limits) and delegate to providers.

---

## Quick Reference Summary

| Topic            | Rule                                                                          |
| ---------------- | ----------------------------------------------------------------------------- |
| Language          | All code in English. UI text in pt-BR.                                        |
| Types             | Strict TypeScript. No `any`. Explicit return types.                          |
| Files             | Max ~200 lines. One responsibility per file.                                 |
| Functions         | Max ~30 lines. Max 3 params. Early returns.                                  |
| Exports           | Named exports (except Next.js pages/layouts).                                |
| Security          | Validate all inputs. No client secrets. Verify webhooks. Sanitize uploads.   |
| API Routes        | Thin handlers → delegate to services. Consistent error format.               |
| Database          | Prisma version 7 only. No raw SQL. No direct import in routes. Always through services.|
| Usage Plans       | Hard limits. Consume quota → credits → block. No negative balance.           |
| State             | Zustand for global UI state. Server state via fetch/SWR.                     |
| Tests             | Vitest + Testing Library. Mock externals. Test behavior, not implementation. |
| Errors            | Typed error classes. Centralized handler. Never swallow errors silently.      |
| Logging           | Structured with `[Module]` prefix. Never log secrets.                        |
| Git               | Conventional Commits. Feature branches off `develop`.                        |
| DDD               | Types, services, domain errors — yes. Aggregates, event sourcing — no.       |

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


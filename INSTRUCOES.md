# Project Instructions — Virtual Try-On App

> This document defines the implementation rules, architecture patterns, libraries, and coding standards for the project.
> Every contributor (human or AI) must follow these guidelines to ensure security, clarity, and maintainability.

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

```bash
# Check current version
node --version

# If using nvm, install and use Node.js 20+
nvm install 20
nvm use 20
```

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

```
┌─────────────────────────────────────────────┐
│  app/              → Routes, Pages, Layouts │  (Presentation)
│  app/api/          → API Route Handlers     │  (Interface / Controller)
├─────────────────────────────────────────────┤
│  lib/services/     → Business Logic         │  (Application / Domain)
│  lib/validators/   → Input Validation       │  (Domain Guard)
├─────────────────────────────────────────────┤
│  lib/providers/    → AI Provider Adapters   │  (Infrastructure)
│  db/               → Prisma Schema & Client │  (Infrastructure)
│  lib/auth/         → Auth Configuration     │  (Infrastructure)
│  lib/stripe/       → Payment Integration    │  (Infrastructure)
├─────────────────────────────────────────────┤
│  types/            → Shared Type Defs       │  (Cross-cutting)
│  lib/utils/        → Pure Utility Functions │  (Cross-cutting)
│  lib/constants/    → App-wide Constants     │  (Cross-cutting)
└─────────────────────────────────────────────┘
```

---

## 3. Folder Structure

```
virtual-try-on-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (providers, global UI)
│   ├── page.tsx                  # Landing / home page
│   ├── globals.css               # Tailwind imports + custom styles
│   ├── api/                      # API route handlers
│   │   ├── auth/[...nextauth]/   # NextAuth route handler
│   │   ├── try-on/route.ts       # Try-on generation endpoint
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts # Create checkout session
│   │   │   ├── portal/route.ts   # Customer portal redirect
│   │   │   └── webhook/route.ts  # Stripe webhook handler
│   │   └── usage/route.ts        # Usage tracking endpoint
│   ├── dashboard/page.tsx        # Authenticated user dashboard
│   ├── login/page.tsx            # Login page
│   ├── pricing/page.tsx          # Pricing plans page
│   ├── billing/page.tsx          # Billing management page
│   └── checkout/
│       ├── success/page.tsx      # Post-checkout success
│       └── cancel/page.tsx       # Post-checkout cancellation
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Generic UI primitives (Button, Input, Modal, etc.)
│   ├── layout/                   # Layout components (Header, Footer, Sidebar)
│   └── features/                 # Feature-specific components (TryOnForm, ImagePreview, etc.)
│
├── lib/                          # Application logic & infrastructure
│   ├── auth/                     # NextAuth config and helpers
│   │   └── options.ts            # NextAuth options (providers, callbacks)
│   ├── services/                 # Business logic (use cases)
│   │   ├── try-on.service.ts     # Try-on orchestration logic
│   │   ├── usage.service.ts      # Usage tracking and limits
│   │   └── billing.service.ts    # Billing and subscription logic
│   ├── providers/                # External API adapters
│   │   ├── gemini.provider.ts    # Google Gemini integration
│   │   └── replicate.provider.ts # Replicate integration
│   ├── stripe/                   # Stripe setup and helpers
│   │   └── client.ts            # Stripe SDK initialization
│   ├── validators/               # Input validation functions
│   │   └── try-on.validator.ts   # Validate try-on request inputs
│   ├── utils/                    # Pure utility functions
│   │   ├── image.ts              # Image processing helpers
│   │   └── format.ts             # Formatting helpers
│   └── constants/                # App-wide constants
│       └── plans.ts              # Pricing plan definitions
│
├── db/                           # Database layer
│   ├── schema.prisma             # Prisma schema definition
│   ├── client.ts                 # Singleton Prisma client
│   ├── migrations/               # Prisma migrations (auto-generated)
│   └── seed.ts                   # Database seeding script
│
├── types/                        # Shared TypeScript types
│   ├── try-on.ts                 # Try-on domain types
│   ├── user.ts                   # User-related types
│   └── api.ts                    # API request/response types
│
├── public/                       # Static assets
│   └── uploads/                  # Uploaded images (dev only)
│
├── __tests__/                    # Test files (mirrors app structure)
│   ├── services/
│   ├── api/
│   └── components/
│
└── config files...               # next.config.js, tsconfig.json, etc.
```

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

```typescript
// ✅ CORRECT: Explicit types, named export, clear intent
export function calculateUsagePercentage(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min((used / limit) * 100, 100)
}

// ❌ WRONG: Implicit any, default export, unclear name
export default function calc(a, b) {
  return (a / b) * 100
}
```

- Always use **strict TypeScript** (`"strict": true` in tsconfig).
- Define **return types** for all public functions.
- Use **interfaces** for object shapes that can be extended; use **types** for unions, intersections, and mapped types.
- Prefer **`readonly`** for properties that should not be mutated.
- Use **discriminated unions** for state modeling (avoid boolean flags).

```typescript
// ✅ Discriminated union — clear and exhaustive
type TryOnResult =
  | { status: 'success'; imageUrl: string }
  | { status: 'safety_blocked'; reason: string }
  | { status: 'error'; message: string }

// ❌ Boolean flags — ambiguous and error-prone
type TryOnResult = {
  success: boolean
  blocked: boolean
  imageUrl?: string
  error?: string
}
```

### Function Design

- **Max 30 lines per function** (soft limit). If a function grows beyond this, break it down.
- **Max 3 parameters**. If more are needed, use an options object.
- **No side effects in utility functions** — keep them pure.
- **Early returns** over nested if/else chains.

```typescript
// ✅ CORRECT: Early returns, clear flow
export function validateImageInput(input: string): ValidationResult {
  if (!input) {
    return { valid: false, error: 'Image input is required' }
  }

  if (!isValidUrl(input) && !isBase64DataUri(input)) {
    return { valid: false, error: 'Must be a valid URL or base64 image' }
  }

  return { valid: true, error: null }
}
```

### File Length

- **Max ~200 lines per file** (soft limit). If growing beyond, split by responsibility.
- If a component has complex logic, extract it into a custom hook (`useXxx.ts`).

### Comments

- Write comments that explain **why**, not **what** (the code should explain what).
- Use `// TODO:` for known incomplete items. Always include context.
- Use `// IMPORTANT:` or `// SECURITY:` for critical notes.

```typescript
// TODO: Add rate limiting per user after billing implementation
// SECURITY: Never log the full API key — only the last 4 characters
```

---

## 5. Security Rules

### Secrets & Environment Variables

- **Never commit `.env` files** — only `.env.example` with empty placeholders.
- **Never expose server secrets to the client** — only `NEXT_PUBLIC_*` vars reach the browser.
- **Validate all env vars at startup** — fail fast if required vars are missing.

```typescript
// lib/config/env.ts
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const env = {
  databaseUrl: requireEnv('DATABASE_URL'),
  nextAuthSecret: requireEnv('NEXTAUTH_SECRET'),
  stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
  // Client-safe vars (already public)
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
} as const
```

### Input Validation

- **Validate ALL external inputs** at the API route handler level — never trust the client.
- Use TypeScript type narrowing and custom validation functions.
- Validate types, formats, length limits, and allowed values.

```typescript
// lib/validators/try-on.validator.ts
export function validateTryOnInput(body: unknown): TryOnRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a JSON object')
  }

  const { personInput, clothingInput } = body as Record<string, unknown>

  if (typeof personInput !== 'string' || personInput.length === 0) {
    throw new ValidationError('personInput is required and must be a string')
  }

  if (personInput.length > MAX_INPUT_LENGTH) {
    throw new ValidationError(`personInput exceeds max length of ${MAX_INPUT_LENGTH}`)
  }

  // ... additional validations

  return { personInput, clothingInput } as TryOnRequest
}
```

### API Security

- **Authenticate all protected routes** — check session before processing.
- **Rate limit API endpoints** — especially AI generation routes (expensive operations).
- **Validate content types** — reject unexpected Content-Type headers.
- **Limit request body size** — configure in `next.config.js` or at the route level.
- **Sanitize file uploads** — validate MIME type, file size, and dimensions.
- **Set security headers** via `next.config.js`:

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

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

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Authentication
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse & Validate Input
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const input = validateInput(body) // throws ValidationError if invalid

  // 3. Execute Business Logic (delegated to service)
  const result = await someService.execute(input, session.user)

  // 4. Return Response
  return NextResponse.json(result, { status: 200 })
}
```

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

- **Schema file**: `db/schema.prisma`
- **Singleton client**: `db/client.ts` — prevents multiple Prisma instances in development.

```typescript
// db/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Schema Guidelines

- Always define `createdAt` and `updatedAt` on every model.
- Use **`@id` with `cuid()`** for primary keys (not auto-increment integers — safer for public APIs).
- Add **database indexes** on fields used in frequent queries (e.g., `userId`, `email`).
- Use **enums** for fixed sets of values (e.g., plan types, status fields).
- Use **relations** instead of storing raw IDs without a formal relation.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  Session[]
  tryOns    TryOn[]
  usage     Usage?

  @@index([email])
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}
```

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

```typescript
// lib/auth/options.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/db/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
```

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

```
components/
  features/
    TryOnForm/
      TryOnForm.tsx        # Component (presentation)
      useTryOnForm.ts      # Hook (logic)
      TryOnForm.test.tsx   # Test
```

### State Management with Zustand

Use Zustand for global state that multiple components need (e.g., user preferences, UI state). Avoid it for server state — use React's built-in data fetching or SWR/React Query for that.

```typescript
// lib/stores/ui.store.ts
import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
```

### Frontend Security

- **Never store sensitive tokens in localStorage** — use httpOnly cookies (handled by NextAuth).
- **Sanitize user-generated content** before rendering — avoid `dangerouslySetInnerHTML`.
- **Use `<Image>` from `next/image`** for all images — handles optimization and prevents common image attacks.

---

## 10. Error Handling

### Custom Error Classes

Define clear, typed errors for different failure scenarios:

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}
```

### Error Handling in API Routes

```typescript
// Centralized error handler helper
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    )
  }

  // Log unexpected errors with context
  console.error('[API Error]', error)

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  )
}
```

---

## 11. Logging

Use structured `console.log` with consistent prefixes for easy filtering in production logs (Vercel aggregates stdout).

### Standards

```typescript
// ✅ Structured, filterable
console.log('[TryOn] Generation started', { userId: user.id, provider: 'gemini' })
console.warn('[Usage] User approaching limit', { userId: user.id, used: 45, limit: 50 })
console.error('[Stripe] Webhook verification failed', { error: err.message })

// ❌ Unstructured, uninformative
console.log('started')
console.log(error)
```

### Rules

- **Always use a `[Module]` prefix** for log context.
- **Never log sensitive data**: API keys, tokens, passwords, full request bodies with personal data.
- **Log action boundaries**: entry/exit of important operations (generation started/completed).
- **Include identifiers**: `userId`, `requestId`, etc., for tracing.
- Use `console.error` only for actual errors, `console.warn` for degraded states, `console.log` for informational events.

---

## 12. Testing

### Framework: Vitest + Testing Library

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

### What to Test

| Layer           | What to Test                                      | Tool                  |
| --------------- | ------------------------------------------------- | --------------------- |
| Services        | Business logic, edge cases, error paths           | Vitest                |
| Validators      | Valid/invalid input combinations                   | Vitest                |
| Utils           | Pure functions, formatting, calculations           | Vitest                |
| API Routes      | Request/response contract, auth checks             | Vitest + mock request |
| Components      | User interactions, conditional rendering           | Testing Library       |

### Test Naming

```typescript
describe('TryOnService', () => {
  it('should return generated image URL on success', async () => { ... })
  it('should throw ValidationError when person input is empty', () => { ... })
  it('should enforce usage limit for free plan users', async () => { ... })
})
```

### Rules

- **No tests for trivial getters/setters.** Test logic, not plumbing.
- **Mock external services** (Gemini, Replicate, Stripe) — never call real APIs in tests.
- **Keep tests isolated** — no shared mutable state between tests.
- **Test the contract, not the implementation** — assertions should verify outputs and side effects, not internal method calls.

---

## 13. Environment & Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Auth
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI Providers
IMAGE_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_IMAGE_MODEL=gemini-2.0-flash-exp-image-generation
REPLICATE_API_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

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
docs: update env configuration in INSTRUCOES.md
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

```typescript
// lib/services/try-on.service.ts
import { prisma } from '@/db/client'
import { GeminiProvider } from '@/lib/providers/gemini.provider'
import { ForbiddenError } from '@/lib/errors'
import type { TryOnRequest, TryOnResult } from '@/types/try-on'

export async function generateTryOn(
  input: TryOnRequest,
  userId: string,
): Promise<TryOnResult> {
  // Domain rule: check usage limits
  const usage = await prisma.usage.findUnique({ where: { userId } })
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

  if (usage && usage.count >= getPlanLimit(user.plan)) {
    throw new ForbiddenError('Usage limit exceeded for your current plan')
  }

  // Delegate to infrastructure provider
  const result = await GeminiProvider.generate(input)

  // Track usage
  await prisma.usage.upsert({
    where: { userId },
    create: { userId, count: 1 },
    update: { count: { increment: 1 } },
  })

  return result
}
```

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
| Database          | Prisma only. No raw SQL. No direct import in routes. Always through services.|
| State             | Zustand for global UI state. Server state via fetch/SWR.                     |
| Tests             | Vitest + Testing Library. Mock externals. Test behavior, not implementation. |
| Errors            | Typed error classes. Centralized handler. Never swallow errors silently.      |
| Logging           | Structured with `[Module]` prefix. Never log secrets.                        |
| Git               | Conventional Commits. Feature branches off `develop`.                        |
| DDD               | Types, services, domain errors — yes. Aggregates, event sourcing — no.       |


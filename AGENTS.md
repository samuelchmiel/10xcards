# AGENTS.md

AI-powered educational flashcard generator. Create decks, add flashcards manually, or auto-generate from text using AI.

## Commands

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build

# Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier

# Testing
npm test             # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)

# Shadcn/ui
npx shadcn@latest add [component-name]
```

## Tech Stack

- **Astro 5** - SSR framework (`output: "server"`, Node adapter)
- **React 19** - Interactive islands only
- **TypeScript 5** - Strict mode
- **Tailwind CSS 4** - Via Vite plugin
- **shadcn/ui** - Component library (new-york style, neutral color)
- **Supabase** - PostgreSQL + Auth
- **OpenRouter.ai** - AI generation (Claude Haiku 3.5)
- **Zod** - Input validation
- **Vitest + Playwright** - Testing

## Project Structure

```
src/
├── layouts/              # Astro layouts
├── pages/                # Routes and API endpoints
│   └── api/              # REST API
├── components/           # Astro (static) + React (interactive)
│   ├── ui/               # shadcn/ui (don't modify)
│   └── hooks/            # React hooks
├── lib/                  # Helpers
│   └── services/         # Business logic
├── db/                   # Supabase client + types
├── types.ts              # Shared types (entities, DTOs)
└── middleware/           # Astro middleware

.ai/                      # Documentation
├── prd.md                # Requirements
├── tech-stack.md         # Stack details
├── db-plan.md            # DB schema + ERD
└── api-plan.md           # API spec

supabase/migrations/      # DB migrations
```

## Path Aliases

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Code Style

### TypeScript

- Strict mode enabled
- Explicit return types for public functions
- Use Zod for runtime validation
- No `any` type

### Error Handling

```typescript
// ✅ Early returns with guard clauses
async function getDeck(id: string, userId: string) {
  if (!id) return { error: "Missing deck ID" };
  if (!userId) return { error: "Unauthorized" };

  const deck = await supabase.from("decks").select().eq("id", id).single();
  if (!deck.data) return { error: "Deck not found" };

  return { data: deck.data };
}
```

### Naming Conventions

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `kebab-case/[param].ts`
- Migrations: `YYYYMMDDHHmmss_description.sql`

## Components

### When to Use What

| Type | Use Case |
|------|----------|
| `.astro` | Static content, layouts |
| `.tsx` | Interactivity needed |

### Astro Islands

```astro
<Component client:load />     <!-- Hydrate immediately -->
<Component client:visible />  <!-- Hydrate when visible -->
<Component client:idle />     <!-- Hydrate when idle -->
```

### React Standards

- Functional components with hooks only
- No `"use client"` (not Next.js)
- `React.memo()` for expensive components
- `useCallback` for handlers passed to children
- `useId()` for accessibility IDs
- Add `data-testid` to interactive elements

## API Endpoints

```typescript
// src/pages/api/decks/index.ts
export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;
  // ...
};
```

### Requirements

- `export const prerender = false` on all routes
- Zod validation for inputs
- Business logic in `src/lib/services/`
- Response format: `{ data: T }` or `{ error: string }`
- Status codes: 200, 201, 400, 401, 404, 500

## Database (Supabase)

- Access via `context.locals.supabase` (not direct import)
- Always enable RLS on new tables
- Granular RLS policies (separate per operation + role)
- Migrations in `supabase/migrations/`
- Index frequently queried columns (`user_id`, `deck_id`)

## Testing

### Vitest

- Pattern: Arrange-Act-Assert
- `vi.fn()` for mocks
- `environment: 'jsdom'` for components

### Playwright

- Target with `data-testid`
- `page.waitForSelector()` for async content

## Git Workflow

### Branches

```
feature/issue-{number}-{description}
fix/issue-{number}-{description}
```

### Commits (Conventional)

```
feat(api): add deck CRUD endpoints
fix(auth): handle expired tokens
test(ui): add dashboard tests
```

Scopes: `api`, `ui`, `auth`, `db`, `ai`, `test`, `ci`

### PR Flow

1. Create branch from issue
2. Implement changes
3. Push and create PR
4. Wait for review (never auto-merge)
5. Address feedback or merge after approval

## Constraints

**DO NOT:**
- Use `any` type
- Use `"use client"` directive
- Modify files in `src/components/ui/`
- Import Supabase client directly (use `locals.supabase`)
- Create tables without RLS
- Auto-merge PRs

**DO:**
- Use early returns for error handling
- Add `data-testid` to interactive elements
- Validate with Zod
- Use `@/` path aliases
- Follow Conventional Commits

## Environment Variables

```env
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-xxx
```

## Code Review Focus (Codex)

When reviewing PRs, check for:

1. **Security**
   - RLS policies on new tables
   - Input validation with Zod
   - No hardcoded secrets

2. **Code Quality**
   - Early returns pattern
   - No `any` types
   - Proper error handling

3. **Architecture**
   - Business logic in services
   - Correct component type (`.astro` vs `.tsx`)
   - API response format consistency

4. **Testing**
   - `data-testid` on interactive elements
   - Test coverage for new features

5. **Git**
   - Conventional commit format
   - PR closes related issue

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: 10xCards

AI-powered educational flashcard generator. Users can create flashcard decks, manually add flashcards, and automatically generate flashcards from text using AI.

## Commands

```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm test             # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
```

To add a new shadcn/ui component:
```bash
npx shadcn@latest add [component-name]
```

## Tech Stack

- **Astro 5** - Web framework with SSR (`output: "server"` with Node adapter)
- **React 19** - For interactive components only
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS 4** - Via Vite plugin
- **shadcn/ui** - Component library (new-york style, neutral base color, lucide icons)
- **Supabase** - PostgreSQL database + authentication
- **OpenRouter.ai** - AI flashcard generation (Claude Haiku 3.5)
- **Zod** - Input validation
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **GitHub Actions** - CI/CD pipeline

## Architecture

### Project Structure

```
src/
├── layouts/              # Astro layouts
├── pages/                # Astro pages and routes
│   └── api/              # API endpoints
├── components/           # Astro (static) and React (interactive) components
│   ├── ui/               # shadcn/ui (add via CLI, don't hand-edit)
│   └── hooks/            # Custom React hooks
├── lib/                  # Services and helpers
│   └── services/         # Business logic services
├── db/                   # Supabase clients and types
├── types.ts              # Shared types (entities, DTOs)
└── middleware/           # Astro middleware

.ai/                      # AI context documentation
├── prd.md                # Product Requirements Document
├── tech-stack.md         # Technology stack details
├── db-plan.md            # Database schema (with Mermaid ERD)
└── api-plan.md           # REST API specification

supabase/migrations/      # Database migrations (YYYYMMDDHHmmss_description.sql)
```

### Path Aliases

Use `@/*` to import from `src/*`:
```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

---

## AI Support Level: Expert

- Favor elegant, maintainable solutions over verbose code
- Assume understanding of language idioms and design patterns
- Highlight performance implications and optimization opportunities
- Frame solutions within broader architectural contexts
- Focus comments on 'why' not 'what'
- Proactively address edge cases, race conditions, and security considerations
- Provide targeted diagnostic approaches when debugging
- Suggest comprehensive testing strategies

---

## Component Guidelines

- Use `.astro` components for static content and layouts
- Use React (`.tsx`) only when interactivity is needed
- **Never use Next.js directives like "use client"**
- Add `data-testid` attributes to all interactive UI elements for E2E testing

### Astro Islands (Hydration Directives)

```astro
<!-- Hydrate immediately (login forms, dashboards) -->
<Component client:load />

<!-- Hydrate when visible in viewport -->
<Component client:visible />

<!-- Hydrate when browser is idle -->
<Component client:idle />

<!-- Never render on server -->
<Component client:only="react" />
```

### React Standards

- Use functional components with hooks (no class components)
- Use `React.memo()` for expensive components with same props
- Use `useCallback` for event handlers passed to children
- Use `useMemo` for expensive calculations
- Use `useId()` for accessibility attribute IDs

---

## API Endpoints

- Use uppercase HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- Add `export const prerender = false` to all API routes
- Use Zod for input validation
- Extract business logic to services in `src/lib/services/`
- Return consistent JSON: `{ data: T }` for success, `{ error: string }` for errors
- Use appropriate HTTP status codes: 200, 201, 400, 401, 404, 500

```typescript
// src/pages/api/decks/index.ts
export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;
  // ...
};
```

---

## Supabase Integration

- Access Supabase via `context.locals.supabase` in Astro routes (not direct import)
- Use `SupabaseClient` type from `src/db/supabase.client.ts`
- Database migrations go in `supabase/migrations/` with format `YYYYMMDDHHmmss_description.sql`
- **Always enable Row Level Security (RLS) on new tables**
- Create granular RLS policies (separate policies per operation and role)
- Use connection pooling for efficient connection management
- Create indexes for frequently queried columns (`user_id`, `deck_id`)

---

## Coding Patterns

### Error Handling

- Use early returns and guard clauses for error handling
- Place happy path last in functions
- Avoid unnecessary else statements; use if-return pattern
- Use custom error types for consistent error handling

```typescript
// ✅ Good - early returns
async function getDeck(id: string, userId: string) {
  if (!id) return { error: "Missing deck ID" };
  if (!userId) return { error: "Unauthorized" };
  
  const deck = await supabase.from("decks").select().eq("id", id).single();
  if (!deck.data) return { error: "Deck not found" };
  
  return { data: deck.data };
}

// ❌ Bad - nested conditions
async function getDeck(id: string, userId: string) {
  if (id) {
    if (userId) {
      const deck = await supabase.from("decks").select().eq("id", id).single();
      if (deck.data) {
        return { data: deck.data };
      } else {
        return { error: "Deck not found" };
      }
    } else {
      return { error: "Unauthorized" };
    }
  } else {
    return { error: "Missing deck ID" };
  }
}
```

### Validation with Zod

```typescript
import { z } from "zod";

const CreateDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

// In API route
const validation = CreateDeckSchema.safeParse(body);
if (!validation.success) {
  return new Response(JSON.stringify({ error: validation.error.errors }), { status: 400 });
}
```

---

## Tailwind CSS Standards

- Use responsive variants: `sm:`, `md:`, `lg:`, `xl:`
- Use state variants: `hover:`, `focus:`, `active:`, `disabled:`
- Implement dark mode with `dark:` variant
- Use arbitrary values for one-off designs: `w-[123px]`
- Extract repeated patterns into component classes with `@apply`

---

## Testing

### Vitest (Unit Tests)

- Use `vi.fn()` for mocks, `vi.spyOn()` for monitoring
- Structure with `describe` blocks and Arrange-Act-Assert pattern
- Use inline snapshots: `expect(value).toMatchInlineSnapshot()`
- Set `environment: 'jsdom'` for component tests

### Playwright (E2E Tests)

- Target elements with `data-testid` attributes
- Use `page.waitForSelector()` for async content

---

## Conventional Commits

Format: `type(scope): description`

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code restructuring |
| `test` | Tests |
| `chore` | Maintenance |

**Scopes:** `api`, `ui`, `auth`, `db`, `ai`, `test`, `ci`

```bash
feat(api): add CRUD endpoints for flashcards
fix(auth): handle expired token refresh
feat(ui)!: redesign dashboard layout
# BREAKING CHANGE: Dashboard props changed
```

---

## GitHub Actions CI/CD

- Use `npm ci` for dependency installation
- Attach secrets to jobs, not global workflows
- Use `.nvmrc` for Node.js version
- Use latest major versions of public actions

---

## Accessibility (ARIA)

- Use ARIA landmarks for page regions
- Set `aria-expanded` and `aria-controls` for expandable content
- Apply `aria-label` for elements without visible text
- Use `aria-invalid` for form validation errors
- Avoid redundant ARIA on semantic HTML elements

---

## Environment Variables

Required in `.env`:
```
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENROUTER_API_KEY=sk-or-v1-xxx
```

---

## Documentation

| Document | Location | Description |
|----------|----------|-------------|
| PRD | `.ai/prd.md` | Product Requirements |
| Tech Stack | `.ai/tech-stack.md` | Technology details |
| Database | `.ai/db-plan.md` | Schema with Mermaid ERD |
| API | `.ai/api-plan.md` | REST API specification |

---

## Workflow 3x3

When implementing features:

1. **Execute** maximum 3 steps
2. **Summarize** what was done
3. **Describe** plan for next 3 steps
4. **Wait** for feedback before continuing

---

## Git Workflow - Issue-Driven Development

### Branch Naming Convention

```
feature/issue-{number}-{short-description}
fix/issue-{number}-{short-description}
refactor/issue-{number}-{short-description}
```

### Issue → Branch → PR Cycle

```
┌─────────────────────────────────────────────────────────────┐
│  CLAUDE (implementation):                                    │
│  1. gh issue view {number}         # Read issue details     │
│  2. git checkout -b feature/...    # Create branch          │
│  3. [Implement with Workflow 3x3]  # Code changes           │
│  4. git add . && git commit        # Commit changes         │
│  5. git push -u origin {branch}    # Push branch            │
│  6. gh pr create                   # Create PR              │
│  7. STOP - return PR URL           # Wait for review        │
├─────────────────────────────────────────────────────────────┤
│  YOU (review on GitHub):                                     │
│  8. Review changes in PR           # Check code             │
│  9. Approve OR Request changes     # Give feedback          │
│  10. Merge PR (or ask Claude)      # Complete               │
└─────────────────────────────────────────────────────────────┘
```

### GitHub CLI Commands

```bash
# Issues
gh issue list                          # List open issues
gh issue view {number}                 # Read issue details
gh issue create --title "..." --body "..."

# Pull Requests
gh pr create --title "..." --body "closes #{number}"
gh pr list                             # List open PRs
gh pr view {number}                    # View PR details
gh pr diff {number}                    # Show PR diff
gh pr checks {number}                  # Check CI status

# After your approval (only when instructed)
gh pr merge {number} --squash          # Merge PR
```

### PR Review Scenarios

**Scenario A: Approved - you merge on GitHub**
```
Claude: PR created: https://github.com/user/repo/pull/3
You: [Review on GitHub → Approve → Click "Merge"]
You: "Next issue"
```

**Scenario B: Approved - Claude merges**
```
Claude: PR created: https://github.com/user/repo/pull/3
You: [Review on GitHub → Approve]
You: "Merge PR #3"
Claude: $ gh pr merge 3 --squash
        $ git checkout main && git pull
```

**Scenario C: Changes requested**
```
Claude: PR created: https://github.com/user/repo/pull/3
You: [Add comments on GitHub requesting changes]
You: "Read PR #3 comments and fix the issues"
Claude: $ gh pr view 3 --comments
        [Makes fixes, commits, pushes to same branch]
        "Changes pushed. PR updated."
You: [Review again → Approve → Merge]
```

### Commit Messages (Conventional Commits)

```bash
feat(scope): description     # New feature
fix(scope): description      # Bug fix
docs(scope): description     # Documentation
test(scope): description     # Tests
chore(scope): description    # Maintenance

# Scopes: api, ui, auth, db, ai, test, ci
```

### PR Description Template

```markdown
## Summary
Brief description of changes.

## Changes
- Added X
- Updated Y
- Fixed Z

## Testing
- [ ] Manual testing done
- [ ] Unit tests pass

closes #{issue_number}
```

### IMPORTANT: Claude MUST stop after creating PR

After `gh pr create`, Claude must:
1. Return the PR URL
2. Wait for user instruction
3. **Never auto-merge**

User decides:
- Review and merge on GitHub, OR
- Say "Merge PR #X" for Claude to merge, OR
- Request changes via GitHub comments

---

## Project Issues

All project issues are defined in `.ai/issues.md`.

**Create issues on GitHub:**
```
"Read .ai/issues.md and create all issues on GitHub"
```

**Implement an issue:**
```
"Implement issue #3"
```

**After PR review:**
```
"Merge PR #3"           # If approved
"Fix PR #3 comments"    # If changes requested
```

### Implementation Order

```
#1 Bootstrap → #2 Database → #3 Decks API → #4 Flashcards API
     ↓
#5 Auth UI → #6 Dashboard UI → #7 AI Generation
     ↓
#8 Tests → #9 CI/CD → #10 Deployment
```

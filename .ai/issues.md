# GitHub Issues Template - 10xCards

> **Instructions for Claude Code:**
> Read this file and create all issues on GitHub using `gh issue create`.
> After creating issues, start implementation from Issue #1.

---

## Issue #2: Supabase Setup + Database Schema

**Title:** `Supabase Setup + Database Schema`

**Labels:** `database`, `backend`

**Body:**
```markdown
## Description
Create Supabase project and implement database schema with RLS policies.

## Acceptance Criteria
- [ ] Supabase project created (Frankfurt region)
- [ ] Environment variables configured in .env
- [ ] Tables created: `decks`, `flashcards`
- [ ] RLS policies enabled for all tables
- [ ] TypeScript types generated
- [ ] Documentation in .ai/db-plan.md with Mermaid ERD

## Database Schema

### decks
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default uuid_generate_v4() |
| user_id | uuid | FK → auth.users, NOT NULL |
| name | text | NOT NULL, 1-100 chars |
| description | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### flashcards
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default uuid_generate_v4() |
| deck_id | uuid | FK → decks, CASCADE DELETE |
| front | text | NOT NULL, min 1 char |
| back | text | NOT NULL, min 1 char |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

## RLS Policies
- Users can only CRUD their own decks
- Users can only CRUD flashcards in their own decks

## Definition of Done
- [ ] All tables created with correct constraints
- [ ] RLS policies working (tested manually)
- [ ] TypeScript types in src/db/database.types.ts
- [ ] .ai/db-plan.md updated with Mermaid diagram
```

---

## Issue #3: CRUD API - Decks

**Title:** `CRUD API - Decks`

**Labels:** `api`, `backend`

**Body:**
```markdown
## Description
Implement REST API endpoints for deck management.

## Acceptance Criteria
- [ ] GET /api/decks - list user's decks
- [ ] POST /api/decks - create new deck
- [ ] GET /api/decks/[id] - get single deck
- [ ] PUT /api/decks/[id] - update deck
- [ ] DELETE /api/decks/[id] - delete deck

## Technical Requirements
- Zod validation for all inputs
- Bearer token authentication
- Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- Consistent response format: `{ data }` or `{ error }`
- `export const prerender = false` on all routes

## Files to Create
- src/pages/api/decks/index.ts
- src/pages/api/decks/[id].ts

## Zod Schemas
```typescript
const CreateDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

const UpdateDeckSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});
```

## Definition of Done
- [ ] All endpoints working (tested with curl)
- [ ] Authentication required for all endpoints
- [ ] Input validation with proper error messages
- [ ] .ai/api-plan.md updated
```

---

## Issue #4: CRUD API - Flashcards

**Title:** `CRUD API - Flashcards`

**Labels:** `api`, `backend`

**Body:**
```markdown
## Description
Implement REST API endpoints for flashcard management.

## Acceptance Criteria
- [ ] GET /api/flashcards?deck_id=xxx - list flashcards for deck
- [ ] POST /api/flashcards - create flashcard
- [ ] GET /api/flashcards/[id] - get single flashcard
- [ ] PUT /api/flashcards/[id] - update flashcard
- [ ] DELETE /api/flashcards/[id] - delete flashcard

## Technical Requirements
- Verify deck ownership before flashcard operations
- Zod validation for all inputs
- Bearer token authentication
- Consistent with decks API patterns

## Files to Create
- src/pages/api/flashcards/index.ts
- src/pages/api/flashcards/[id].ts

## Zod Schemas
```typescript
const CreateFlashcardSchema = z.object({
  deck_id: z.string().uuid(),
  front: z.string().min(1),
  back: z.string().min(1),
});

const UpdateFlashcardSchema = z.object({
  front: z.string().min(1).optional(),
  back: z.string().min(1).optional(),
});
```

## Definition of Done
- [ ] All endpoints working
- [ ] Deck ownership verified
- [ ] .ai/api-plan.md updated
```

---

## Issue #5: Authentication UI

**Title:** `Authentication UI`

**Labels:** `ui`, `auth`, `frontend`

**Body:**
```markdown
## Description
Implement login/signup UI with Supabase Auth.

## Acceptance Criteria
- [ ] Login page at /login
- [ ] Email/password authentication
- [ ] Sign up functionality
- [ ] Logout functionality
- [ ] Protected routes middleware
- [ ] Redirect to /dashboard after login

## Components to Create
- src/components/auth/LoginForm.tsx
- src/pages/login.astro
- src/middleware/index.ts

## UI Requirements
- Use shadcn/ui components (Button, Input, Card)
- Loading states during authentication
- Error messages for failed auth
- `data-testid` on all interactive elements:
  - `data-testid="email-input"`
  - `data-testid="password-input"`
  - `data-testid="login-button"`
  - `data-testid="signup-button"`
  - `data-testid="logout-button"`

## Definition of Done
- [ ] User can sign up with email/password
- [ ] User can log in
- [ ] User can log out
- [ ] Unauthenticated users redirected to /login
- [ ] All data-testid attributes present
```

---

## Issue #6: Dashboard UI

**Title:** `Dashboard UI`

**Labels:** `ui`, `frontend`

**Body:**
```markdown
## Description
Implement main dashboard with deck and flashcard management.

## Acceptance Criteria
- [ ] Dashboard page at /dashboard
- [ ] Sidebar with list of decks
- [ ] Create new deck form
- [ ] Delete deck functionality
- [ ] Main area showing flashcards for selected deck
- [ ] Create flashcard form
- [ ] Delete flashcard functionality

## Components to Create
- src/components/dashboard/Dashboard.tsx
- src/components/dashboard/DeckList.tsx
- src/components/dashboard/DeckForm.tsx
- src/components/dashboard/FlashcardList.tsx
- src/components/dashboard/FlashcardForm.tsx
- src/pages/dashboard.astro

## UI Requirements
- Responsive layout (mobile-friendly)
- Loading states
- Empty states ("No decks yet", "No flashcards yet")
- Confirmation dialog for delete actions
- `data-testid` on all interactive elements

## data-testid Attributes
- `data-testid="dashboard"`
- `data-testid="deck-list"`
- `data-testid="deck-item-{id}"`
- `data-testid="create-deck-form"`
- `data-testid="deck-name-input"`
- `data-testid="create-deck-button"`
- `data-testid="delete-deck-button-{id}"`
- `data-testid="flashcard-list"`
- `data-testid="flashcard-item-{id}"`
- `data-testid="flashcard-front-input"`
- `data-testid="flashcard-back-input"`
- `data-testid="create-flashcard-button"`
- `data-testid="delete-flashcard-button-{id}"`

## Definition of Done
- [ ] Full CRUD for decks via UI
- [ ] Full CRUD for flashcards via UI
- [ ] Responsive design works on mobile
- [ ] All data-testid attributes present
```

---

## Issue #7: AI Flashcard Generation

**Title:** `AI Flashcard Generation`

**Labels:** `ai`, `backend`, `frontend`

**Body:**
```markdown
## Description
Implement AI-powered flashcard generation using OpenRouter.

## Acceptance Criteria
- [ ] POST /api/generate-flashcards endpoint
- [ ] Integration with OpenRouter API (Claude Haiku 3.5)
- [ ] UI for pasting text and generating flashcards
- [ ] Configurable number of flashcards (1-20)
- [ ] Generated flashcards saved to database

## API Endpoint
```
POST /api/generate-flashcards
{
  "text": "...",
  "deckId": "uuid",
  "count": 5
}
```

## Technical Requirements
- Validate deck ownership
- Parse AI response (JSON array)
- Handle markdown code blocks in response
- Error handling for API failures
- Rate limiting consideration

## UI Components
- Add AI generation section to Dashboard
- Textarea for input text
- Number input for flashcard count
- Generate button with loading state
- `data-testid="ai-generate-section"`
- `data-testid="generate-text-input"`
- `data-testid="generate-count-input"`
- `data-testid="generate-flashcards-button"`

## Definition of Done
- [ ] AI generation working end-to-end
- [ ] Generated flashcards appear in deck
- [ ] Error handling for API failures
- [ ] Loading state during generation
```

---

## Issue #8: Unit Tests (Vitest)

**Title:** `Unit Tests (Vitest)`

**Labels:** `testing`

**Body:**
```markdown
## Description
Implement unit tests for core business logic.

## Acceptance Criteria
- [ ] Vitest configured
- [ ] At least 3 test files
- [ ] Tests pass in CI

## Test Files to Create
- src/lib/validators.test.ts (Zod schema tests)
- src/lib/flashcard-parser.test.ts (AI response parsing)
- src/lib/services/*.test.ts (service layer tests)

## Example Tests
```typescript
describe('CreateDeckSchema', () => {
  it('validates correct deck data', () => {});
  it('rejects empty name', () => {});
  it('rejects name over 100 chars', () => {});
});

describe('parseAIFlashcards', () => {
  it('parses JSON array', () => {});
  it('extracts JSON from markdown code blocks', () => {});
  it('returns empty array for invalid input', () => {});
});
```

## Definition of Done
- [ ] `npm test` passes
- [ ] At least 5 test cases
- [ ] Tests cover happy path and error cases
```

---

## Issue #9: CI/CD Pipeline (GitHub Actions)

**Title:** `CI/CD Pipeline (GitHub Actions)`

**Labels:** `ci`, `devops`

**Body:**
```markdown
## Description
Implement GitHub Actions workflow for CI/CD.

## Acceptance Criteria
- [ ] Workflow runs on push to main and PRs
- [ ] Lint check
- [ ] Type check
- [ ] Unit tests
- [ ] Build verification

## Workflow File
`.github/workflows/ci.yml`

## Jobs
1. **lint** - Run ESLint
2. **typecheck** - Run TypeScript compiler
3. **test** - Run Vitest
4. **build** - Verify production build

## Secrets Required
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`

## Definition of Done
- [ ] Workflow file created
- [ ] All jobs pass on main branch
- [ ] Secrets configured in GitHub
- [ ] Badge added to README
```

---

## Issue #10: Deployment (Cloudflare Pages)

**Title:** `Deployment (Cloudflare Pages)`

**Labels:** `deployment`, `devops`

**Body:**
```markdown
## Description
Deploy application to Cloudflare Pages.

## Acceptance Criteria
- [ ] Cloudflare Pages project created
- [ ] GitHub integration configured
- [ ] Environment variables set
- [ ] Automatic deployments on push to main
- [ ] Production URL working

## Configuration
- Build command: `npm run build`
- Build output: `dist/`
- Node.js version: 22

## Environment Variables (Cloudflare Dashboard)
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`

## Definition of Done
- [ ] Site accessible at public URL
- [ ] Authentication working
- [ ] AI generation working
- [ ] All features functional
```

---

## Quick Reference - Creating Issues

```bash
# Create all issues at once
gh issue create --title "Project Bootstrap + CLAUDE.md" --label "setup,documentation" --body-file .ai/issues/01-bootstrap.md

# Or let Claude Code create them:
# "Read .ai/issues.md and create all issues on GitHub"
```

## Implementation Order

```
#1 Bootstrap → #2 Database → #3 Decks API → #4 Flashcards API
     ↓
#5 Auth UI → #6 Dashboard UI → #7 AI Generation
     ↓
#8 Tests → #9 CI/CD → #10 Deployment
```

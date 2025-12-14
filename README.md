# 10xCards

AI-powered educational flashcard generator. Create flashcard decks, add cards manually, or let AI generate them from any text.

## Features

- **Deck Management** - Create, rename, and delete flashcard decks
- **Manual Flashcards** - Add, edit, and delete flashcards with front/back content
- **AI Generation** - Paste text and generate flashcards automatically with Claude AI
- **Preview & Select** - Review AI-generated cards before saving, edit as needed
- **Study Mode** - Flip-card study with shuffle, progress tracking, and keyboard shortcuts
- **Usage Limits** - 75 AI-generated flashcards lifetime limit per user

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/) with SSR (Cloudflare adapter)
- **UI**: [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Row Level Security)
- **AI**: [OpenRouter](https://openrouter.ai/) (Claude 3.5 Haiku)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (unit) + [Playwright](https://playwright.dev/) (E2E)
- **CI/CD**: GitHub Actions
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/samuelchmiel/10xcards.git
cd 10xcards
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your credentials:
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=sk-or-v1-your-key
```

4. Set up Supabase database:
   - Run migrations from `supabase/migrations/`
   - Enable Row Level Security on all tables

5. Start development server:
```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |

## Project Structure

```
src/
├── components/       # React & Astro components
│   ├── auth/         # Login/Register forms
│   ├── dashboard/    # Dashboard UI components
│   ├── study/        # Study mode components
│   └── ui/           # shadcn/ui components
├── pages/            # Astro pages & API routes
│   └── api/          # REST API endpoints
├── lib/              # Services & utilities
├── db/               # Supabase client & types
└── layouts/          # Astro layouts

.ai/                  # AI context documentation
├── prd.md            # Product Requirements
├── tech-stack.md     # Tech stack details
├── db-plan.md        # Database schema
└── api-plan.md       # API specification
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/decks` | GET, POST | List/create decks |
| `/api/decks/[id]` | GET, PUT, DELETE | Get/update/delete deck |
| `/api/flashcards` | GET, POST | List/create flashcards |
| `/api/flashcards/[id]` | PUT, DELETE | Update/delete flashcard |
| `/api/flashcards/bulk` | POST | Bulk create flashcards |
| `/api/generate-flashcards` | POST | Generate flashcards with AI |
| `/api/user/quota` | GET | Get AI usage quota |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI |
| `E2E_TEST_EMAIL` | (Optional) E2E test user email |
| `E2E_TEST_PASSWORD` | (Optional) E2E test user password |

## License

MIT

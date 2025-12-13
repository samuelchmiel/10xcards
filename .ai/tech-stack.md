# Tech Stack - 10xCards

## Overview

10xCards is an AI-powered educational flashcard generator built with modern web technologies. The architecture follows a server-side rendering approach with selective client-side hydration for interactive components (Astro Islands pattern).

---

## Frontend

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Astro** | 5.x | Web framework with SSR (`output: "server"`) |
| **React** | 19.x | Interactive UI components (Islands) |
| **TypeScript** | 5.x | Type safety (strict mode enabled) |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS via Vite plugin |
| **shadcn/ui** | latest | Component library (new-york style, neutral base, lucide icons) |
| **class-variance-authority** | 0.7.x | Variant-based component styling |
| **clsx** + **tailwind-merge** | latest | Conditional class composition |
| **tw-animate-css** | 1.2.x | Animation utilities |
| **Lucide React** | 0.487.x | Icon library |

### Component Architecture
- **Astro components** (`.astro`) for static content and layouts
- **React components** (`.tsx`) only for interactive features
- **Astro Islands** with hydration directives: `client:load`, `client:visible`, `client:idle`

---

## Backend

### Runtime & Server
| Technology | Version | Purpose |
|------------|---------|---------|
| **Astro API Routes** | 5.x | REST API endpoints (serverless) |
| **@astrojs/node** | 9.x | Node.js adapter (standalone mode) |
| **Node.js** | 22.14.0 | Runtime environment (specified in `.nvmrc`) |

### Database & Authentication
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database + Row Level Security |
| **Supabase Auth** | Authentication (email/password) |

### AI Integration
| Technology | Model | Purpose |
|------------|-------|---------|
| **OpenRouter.ai** | Claude Haiku 3.5 | AI flashcard generation |

### Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zod** | latest | Runtime schema validation for API inputs |

---

## Testing

### Unit Testing
| Technology | Purpose |
|------------|---------|
| **Vitest** | Fast unit testing framework |

### End-to-End Testing
| Technology | Purpose |
|------------|---------|
| **Playwright** | Browser automation and E2E tests |

### Testing Conventions
- Use `data-testid` attributes on interactive elements
- Arrange-Act-Assert pattern for unit tests
- `describe` blocks for test organization

---

## CI/CD & DevOps

### Continuous Integration
| Technology | Purpose |
|------------|---------|
| **GitHub Actions** | Automated testing, linting, and building |

### Deployment
| Technology | Purpose |
|------------|---------|
| **Cloudflare Pages** | Production hosting with edge deployment |

### Environment
- Node.js version managed via `.nvmrc` (22.14.0)
- Environment variables for secrets (Supabase, OpenRouter)

---

## Code Quality

### Linting
| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.x | Code linting (flat config) |
| **typescript-eslint** | 8.x | TypeScript-specific rules |
| **eslint-plugin-astro** | 1.3.x | Astro file linting |
| **eslint-plugin-react** | 7.x | React best practices |
| **eslint-plugin-react-hooks** | 5.x | React Hooks rules |
| **eslint-plugin-react-compiler** | beta | React Compiler optimizations |
| **eslint-plugin-jsx-a11y** | 6.x | Accessibility linting |
| **eslint-plugin-prettier** | 5.x | Prettier integration |

### Formatting
| Technology | Purpose |
|------------|---------|
| **Prettier** | Code formatting |
| **prettier-plugin-astro** | Astro file formatting |

### Git Hooks
| Technology | Purpose |
|------------|---------|
| **Husky** | Git hooks management |
| **lint-staged** | Run linters on staged files only |

---

## Development Tools

### IDE & Extensions
| Tool | Purpose |
|------|---------|
| **VS Code / Cursor** | Primary IDE |
| **Claude Code** | AI-assisted development |
| **Astro VS Code Extension** | Astro language support |

### Package Management
| Tool | Purpose |
|------|---------|
| **npm** | Package manager |

---

## Project Structure

```
src/
├── components/           # UI components
│   ├── ui/               # shadcn/ui components
│   └── hooks/            # Custom React hooks
├── layouts/              # Astro layouts
├── lib/                  # Utilities and services
│   └── services/         # Business logic
├── pages/                # Routes and pages
│   └── api/              # API endpoints
├── db/                   # Supabase client and types
├── styles/               # Global CSS
├── types.ts              # Shared TypeScript types
└── middleware/           # Astro middleware

.ai/                      # AI context documentation
├── prd.md                # Product Requirements
├── tech-stack.md         # This file
├── db-plan.md            # Database schema
└── api-plan.md           # API specification

supabase/migrations/      # Database migrations
.github/workflows/        # CI/CD pipelines
```

---

## Path Aliases

Configured in `tsconfig.json`:

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

---

## Environment Variables

Required in `.env`:

```env
# Supabase
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI
OPENROUTER_API_KEY=sk-or-v1-xxx
```

---

## Key Architectural Decisions

### 1. Astro with SSR
- **Why**: Optimal performance with server-side rendering
- **How**: `output: "server"` with Node.js adapter
- **Benefit**: Fast initial page loads, SEO-friendly

### 2. React Islands
- **Why**: Interactive components without full SPA overhead
- **How**: Selective hydration with `client:load`, `client:visible`
- **Benefit**: Minimal JavaScript shipped to client

### 3. Tailwind CSS 4 via Vite Plugin
- **Why**: Modern CSS with build-time optimization
- **How**: `@tailwindcss/vite` plugin in `astro.config.mjs`
- **Benefit**: Faster builds, native CSS features

### 4. shadcn/ui Component Library
- **Why**: Accessible, customizable, copy-paste components
- **Style**: new-york, neutral base color
- **Icons**: Lucide React

### 5. Supabase for Backend
- **Why**: PostgreSQL + Auth + RLS in one platform
- **Security**: Row Level Security policies per table
- **Access**: Via `context.locals.supabase` in Astro routes

### 6. OpenRouter.ai for AI
- **Why**: Access to multiple AI models with single API
- **Model**: Claude Haiku 3.5 (cost-effective for generation)
- **Use case**: Automatic flashcard generation from text

---

## Version Compatibility Matrix

| Package | Minimum Version | Notes |
|---------|-----------------|-------|
| Node.js | 22.14.0 | Specified in `.nvmrc` |
| Astro | 5.0.0 | SSR with Node adapter |
| React | 19.0.0 | With React Compiler |
| TypeScript | 5.0.0 | Strict mode |
| Tailwind CSS | 4.0.0 | Vite plugin required |

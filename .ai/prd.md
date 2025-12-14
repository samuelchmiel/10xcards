# Product Requirements Document: 10xCards

## AI-Powered Flashcard Generator

**Version:** 1.0 (MVP)
**Date:** December 2024
**Status:** Draft

---

## 1. Problem Statement

### Context

Students and professionals spend significant time creating study materials — especially flashcards. This process is time-consuming and often leads to procrastination or abandoning effective learning methods altogether.

### Problem

Manual flashcard creation from notes, textbooks, or articles requires:
- Time to analyze material and extract key information
- Skills to formulate questions and answers
- Discipline to maintain a consistent format

As a result, users either create fewer flashcards than they need or give up on this learning method entirely.

### Solution

10xCards automates flashcard creation by using AI to extract key concepts and generate question-answer pairs from any source text — while maintaining the ability to manually create and edit flashcards.

---

## 2. User Stories

### Registration and Login

| ID | User Story | Priority |
|----|------------|----------|
| US-001 | As a new user, I want to create an account with email and password, so that I can save my flashcards and access them from any device. | Must Have |
| US-002 | As a returning user, I want to log in with my credentials, so that I can access my previously created decks. | Must Have |
| US-003 | As a logged-in user, I want to log out, so that I can secure my account on shared devices. | Must Have |

### Deck Management

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-010 | As a user, I want to create a new deck with a custom name, so that I can organize my flashcards by topic or subject. | Must Have | ✅ Implemented |
| US-011 | As a user, I want to see a list of all my decks, so that I can quickly find and access the one I need. | Must Have | ✅ Implemented |
| US-012 | As a user, I want to rename a deck, so that I can keep my organization up to date. | Should Have | ✅ Implemented |
| US-013 | As a user, I want to delete a deck, so that I can remove content I no longer need. | Must Have | ✅ Implemented |
| US-014 | As a user, I want to see how many cards are in each deck, so that I can estimate study time. | Should Have | ✅ Implemented |

### Manual Flashcard Creation

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-020 | As a user, I want to manually add a flashcard with front and back text, so that I can create custom study material. | Must Have | ✅ Implemented |
| US-021 | As a user, I want to edit an existing flashcard, so that I can correct mistakes or improve content. | Must Have | ✅ Implemented |
| US-022 | As a user, I want to delete a flashcard, so that I can remove incorrect or outdated content. | Must Have | ✅ Implemented |

### AI Flashcard Generation

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-030 | As a user, I want to paste text (up to 10,000 characters) and generate flashcards automatically, so that I can save time on manual creation. | Must Have | ✅ Implemented |
| US-031 | As a user, I want to see generated flashcards before adding them to my deck, so that I can review and select only relevant ones. | Must Have | ✅ Implemented |
| US-032 | As a user, I want to edit AI-generated flashcards before saving, so that I can adjust them to my needs. | Should Have | ✅ Implemented |
| US-033 | As a user, I want to see how many AI generations I have left, so that I can plan my usage. | Must Have | ✅ Implemented (lifetime limit) |

### Study Mode

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-040 | As a user, I want to study a deck in flip-card mode, so that I can test my knowledge. | Must Have | ✅ Implemented |
| US-041 | As a user, I want to flip a card to reveal the answer, so that I can check if I knew it. | Must Have | ✅ Implemented |
| US-042 | As a user, I want to navigate to the next/previous card, so that I can go through the entire deck. | Must Have | ✅ Implemented |
| US-043 | As a user, I want to shuffle the deck order, so that I don't memorize cards by position. | Should Have | ✅ Implemented |
| US-044 | As a user, I want to see my progress through the deck (card counter and progress bar). | Should Have | ✅ Implemented |
| US-045 | As a user, I want keyboard shortcuts (Space/Enter to flip, arrows to navigate, Esc to exit). | Could Have | ✅ Implemented |

### Spaced Repetition

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-080 | As a user, I want to rate how well I knew a card (Again, Hard, Good, Easy), so the app can schedule reviews optimally. | Must Have | ✅ Implemented |
| US-081 | As a user, I want cards to be scheduled using the SM-2 algorithm, so I review cards at optimal intervals. | Must Have | ✅ Implemented |
| US-082 | As a user, I want to see which cards are due for review, so I can focus on what needs practice. | Should Have | ✅ Implemented |
| US-083 | As a user, I want a "Review Due" button to study only cards that are due, so I can study efficiently. | Should Have | ✅ Implemented |
| US-084 | As a user, I want keyboard shortcuts (1-4) to rate cards quickly while studying. | Could Have | ✅ Implemented |

### Statistics & Analytics

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-090 | As a user, I want to see my study streak (consecutive days studied), so I stay motivated. | Should Have | ✅ Implemented |
| US-091 | As a user, I want to see my total reviews and accuracy percentage, so I can track my progress. | Should Have | ✅ Implemented |
| US-092 | As a user, I want to see a chart of my reviews over the last 30 days, so I can visualize my study habits. | Should Have | ✅ Implemented |
| US-093 | As a user, I want to see deck progress (mastered vs learning cards), so I know how well I know each deck. | Should Have | ✅ Implemented |
| US-094 | As a user, I want a mini-stats widget in the dashboard, so I can see key stats at a glance. | Could Have | ✅ Implemented |
| US-095 | As a user, I want to see total time studied, so I can track my study commitment. | Could Have | ✅ Implemented |

### Landing Page & Marketing

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-050 | As a visitor, I want to see a landing page explaining the app's features, so that I understand the value proposition before signing up. | Should Have | ✅ Implemented |
| US-051 | As a visitor, I want to see clear call-to-action buttons for registration and login, so that I can easily get started. | Should Have | ✅ Implemented |

### User Profile & Settings

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-060 | As a user, I want to access a profile page, so that I can view my account information. | Should Have | ✅ Implemented |
| US-061 | As a user, I want to see my AI generation quota usage on the profile page, so that I can track my lifetime usage in detail. | Should Have | ✅ Implemented |
| US-062 | As a user, I want to see my AI generation quota in the dashboard sidebar, so that I always know how many generations I have left. | Should Have | ✅ Implemented |

### Navigation & UX

| ID | User Story | Priority | Status |
|----|------------|----------|--------|
| US-070 | As a user, I want navigation links between Dashboard and Profile, so that I can easily switch between views. | Should Have | ✅ Implemented |
| US-071 | As a user, I want to add an optional description when creating a deck, so that I can add context about the deck's content. | Should Have | ✅ Implemented |

---

## 3. Success Metrics

### Product Metrics (North Star)

| Metric | Definition | MVP Target (3 months) |
|--------|------------|----------------------|
| **Weekly Active Users (WAU)** | Users who completed ≥1 study session per week | 500 |
| **Cards Created per User** | Average flashcards per active user | 50 |
| **AI Generation Adoption** | % of users who used AI generation | 60% |

### Engagement Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| Retention D7 | % of users returning after 7 days | 30% |
| Study Sessions per Week | Average study sessions per user | 3 |
| AI-to-Manual Ratio | Ratio of AI cards to manual cards | 70:30 |

### Technical Metrics

| Metric | Target |
|--------|--------|
| AI Generation Time (p95) | < 5 seconds |
| Page Load Time (p95) | < 2 seconds |
| Error Rate | < 1% |
| Uptime | 99.5% |

---

## 4. Technical Specification

### 4.1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    Astro 5 + React 19                       │
│                  Tailwind CSS + shadcn/ui                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (SSR)                          │
│                    Astro API Routes                         │
│                   Cloudflare Workers                        │
└─────────────────────────────────────────────────────────────┘
           │                                    │
           ▼                                    ▼
┌─────────────────────┐              ┌─────────────────────────┐
│   Supabase Auth     │              │      OpenRouter.ai      │
│   Supabase DB       │              │    (Claude Haiku 3.5)   │
│   (PostgreSQL)      │              │                         │
└─────────────────────┘              └─────────────────────────┘
```

### 4.2 Data Model (Supabase/PostgreSQL)

```sql
-- Users (managed by Supabase Auth)
-- Available via auth.users()

-- Decks
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards (with SM-2 spaced repetition fields)
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    easiness_factor DECIMAL(4,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    next_review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Quotas (lifetime AI generation tracking)
CREATE TABLE user_quotas (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    ai_generation_count INTEGER NOT NULL DEFAULT 0,
    ai_generation_limit INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions (analytics)
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    cards_studied INTEGER DEFAULT 0,
    cards_correct INTEGER DEFAULT 0,
    cards_incorrect INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card Reviews (analytics)
CREATE TABLE card_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flashcard_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 0 AND rating <= 5),
    time_to_answer INTEGER,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security enabled on all tables
-- Users can only access their own data
```

### 4.3 Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page with features and CTAs | No |
| `/login` | User login form | No |
| `/register` | User registration form | No |
| `/dashboard` | Main app - deck list, flashcard management, AI generation | Yes |
| `/profile` | User profile with account info and quota details | Yes |
| `/study/[deckId]` | Study mode - flip cards with spaced repetition rating | Yes |
| `/stats` | Statistics page with study analytics and visualizations | Yes |

### 4.4 API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/decks` | GET | List user's decks | Yes |
| `/api/decks` | POST | Create new deck | Yes |
| `/api/decks/[id]` | GET | Get deck details | Yes |
| `/api/decks/[id]` | PUT | Update deck | Yes |
| `/api/decks/[id]` | DELETE | Delete deck | Yes |
| `/api/flashcards` | GET | List flashcards (by deck_id) | Yes |
| `/api/flashcards` | POST | Create flashcard | Yes |
| `/api/flashcards/[id]` | PUT | Update flashcard | Yes |
| `/api/flashcards/[id]` | DELETE | Delete flashcard | Yes |
| `/api/flashcards/[id]/review` | POST | Submit review rating (SM-2) | Yes |
| `/api/flashcards/bulk` | POST | Bulk create flashcards | Yes |
| `/api/generate-flashcards` | POST | Generate flashcards with AI | Yes |
| `/api/user/quota` | GET | Get AI generation quota | Yes |
| `/api/study-sessions` | GET, POST | List/create study sessions | Yes |
| `/api/study-sessions/[id]` | GET, PUT | Get/update study session | Yes |
| `/api/stats` | GET | Get user statistics | Yes |

### 4.5 AI Generation Specification

**Input:**
```typescript
interface GenerateRequest {
    text: string;        // max 10,000 characters
    deck_id: string;     // target deck
    count?: number;      // number of cards (1-20, default 5)
}
```

**OpenRouter Configuration:**
- Model: `anthropic/claude-3.5-haiku`
- Max tokens: 2000
- Temperature: 0.7

**Output:**
```typescript
interface GenerateResponse {
    data: Array<{
        id: string;
        deck_id: string;
        front: string;
        back: string;
        created_at: string;
        updated_at: string;
    }>;
}
```

### 4.6 Usage Limits

| Feature | Current Implementation |
|---------|----------------------|
| AI Generations | 20 lifetime per user |
| Max decks | Unlimited |
| Max cards per deck | Unlimited |
| Max input text length | 10,000 characters |

### 4.7 Security Requirements

- All API endpoints require valid JWT token (via Supabase Auth)
- Row Level Security (RLS) enabled on all tables
- Input validation with Zod schemas
- HTTPS only
- Environment variables for all secrets

---

## 5. Out of Scope (NOT in MVP)

### Features Excluded from MVP

| Feature | Reason | Status |
|---------|--------|--------|
| **Spaced Repetition (SM-2)** | Algorithm complexity | ✅ Implemented v1.0 |
| **Study Statistics** | Requires progress tracking | ✅ Implemented v1.0 |
| **Import from Anki/Quizlet** | Requires format reverse-engineering | v1.5 |
| **Export to PDF/Anki** | Nice-to-have, not core value | v1.5 |
| **Deck Sharing** | Requires permission system | v2.0 |
| **Public Deck Library** | Requires moderation | v3.0 |
| **Social Login (Google/GitHub)** | Email auth sufficient for start | v1.2 |
| **Native Mobile App** | Responsive web sufficient | v2.0+ |
| **Offline Mode / PWA** | Sync complexity | v1.5 |
| **Image Support** | Storage and AI vision complexity | v2.0 |
| **Audio/TTS** | Integration complexity | v2.0 |
| **Gamification (streaks, XP)** | Nice-to-have (partial: streak implemented) | v2.0 |

### Intentional Technical Limitations

- No real-time sync (page refresh for new data)
- No undo/redo
- No bulk operations
- No advanced search/filter
- No dark mode (initial release)
- No i18n (English only initially)

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Deck** | A collection of flashcards grouped by topic |
| **Flashcard** | A single card with front (question) and back (answer) sides |
| **Study Mode** | Mode for reviewing flashcards in flip-card format |
| **AI Generation** | Automatic flashcard creation by AI from source text |

---

*Document prepared: December 2024*
*Last updated: December 14, 2024 - Spaced Repetition (SM-2) and Statistics implemented*

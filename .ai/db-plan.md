# Database Plan - 10xCards

## Overview

This document describes the database schema for 10xCards, an AI-powered educational flashcard generator.

## Database Provider

- **Provider:** Supabase (PostgreSQL)
- **Region:** Frankfurt (eu-central-1)
- **Features:** Row Level Security (RLS), Real-time subscriptions, Auth integration

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ decks : "owns"
    users ||--o{ user_quotas : "has"
    users ||--o{ study_sessions : "creates"
    users ||--o{ card_reviews : "submits"
    decks ||--o{ flashcards : "contains"
    decks ||--o{ study_sessions : "studied_in"
    flashcards ||--o{ card_reviews : "reviewed_in"
    study_sessions ||--o{ card_reviews : "contains"

    users {
        uuid id PK
        string email
        timestamptz created_at
    }

    decks {
        uuid id PK
        uuid user_id FK
        text name
        text description
        timestamptz created_at
        timestamptz updated_at
    }

    flashcards {
        uuid id PK
        uuid deck_id FK
        text front
        text back
        decimal easiness_factor
        integer interval_days
        integer repetitions
        date next_review_date
        timestamptz created_at
        timestamptz updated_at
    }

    user_quotas {
        uuid user_id PK_FK
        integer ai_generation_count
        integer ai_generation_limit
        timestamptz created_at
        timestamptz updated_at
    }

    study_sessions {
        uuid id PK
        uuid user_id FK
        uuid deck_id FK
        timestamptz started_at
        timestamptz ended_at
        integer cards_studied
        integer cards_correct
        integer cards_incorrect
        timestamptz created_at
    }

    card_reviews {
        uuid id PK
        uuid flashcard_id FK
        uuid user_id FK
        uuid session_id FK
        integer rating
        integer time_to_answer
        timestamptz reviewed_at
    }
```

## Tables

### `decks`

Stores user-created flashcard decks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `uuid_generate_v4()` | Unique deck identifier |
| `user_id` | `uuid` | FK → `auth.users`, NOT NULL, CASCADE DELETE | Owner of the deck |
| `name` | `text` | NOT NULL, 1-100 chars | Deck name |
| `description` | `text` | nullable | Optional deck description |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

**Indexes:**
- `idx_decks_user_id` on `user_id` - for efficient user deck queries

### `flashcards`

Stores individual flashcards within decks, with SM-2 spaced repetition data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `uuid_generate_v4()` | Unique flashcard identifier |
| `deck_id` | `uuid` | FK → `decks`, NOT NULL, CASCADE DELETE | Parent deck |
| `front` | `text` | NOT NULL, min 1 char | Question/prompt side |
| `back` | `text` | NOT NULL, min 1 char | Answer side |
| `easiness_factor` | `decimal(4,2)` | default 2.5 | SM-2 easiness factor (1.3-2.5+) |
| `interval_days` | `integer` | default 0 | Days until next review |
| `repetitions` | `integer` | default 0 | Successful repetition count |
| `next_review_date` | `date` | nullable | Scheduled next review date |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

**Indexes:**
- `idx_flashcards_deck_id` on `deck_id` - for efficient flashcard queries by deck
- `idx_flashcards_next_review_date` on `next_review_date` - for due card queries

### `user_quotas`

Tracks lifetime AI generation limits per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `uuid` | PK, FK → `auth.users`, CASCADE DELETE | User identifier |
| `ai_generation_count` | `integer` | NOT NULL, default 0 | Cards generated so far |
| `ai_generation_limit` | `integer` | NOT NULL, default 75 | Lifetime limit |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | Last update timestamp |

### `study_sessions`

Tracks study sessions for analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `uuid_generate_v4()` | Unique session identifier |
| `user_id` | `uuid` | FK → `auth.users`, NOT NULL, CASCADE DELETE | Session owner |
| `deck_id` | `uuid` | FK → `decks`, NOT NULL, CASCADE DELETE | Studied deck |
| `started_at` | `timestamptz` | NOT NULL, default `now()` | Session start time |
| `ended_at` | `timestamptz` | nullable | Session end time |
| `cards_studied` | `integer` | NOT NULL, default 0 | Total cards reviewed |
| `cards_correct` | `integer` | NOT NULL, default 0 | Cards rated 3+ |
| `cards_incorrect` | `integer` | NOT NULL, default 0 | Cards rated < 3 |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Creation timestamp |

**Indexes:**
- `idx_study_sessions_user_id` on `user_id`
- `idx_study_sessions_deck_id` on `deck_id`
- `idx_study_sessions_started_at` on `started_at`

### `card_reviews`

Logs individual card reviews for analytics and history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, default `uuid_generate_v4()` | Unique review identifier |
| `flashcard_id` | `uuid` | FK → `flashcards`, NOT NULL, CASCADE DELETE | Reviewed card |
| `user_id` | `uuid` | FK → `auth.users`, NOT NULL, CASCADE DELETE | Reviewer |
| `session_id` | `uuid` | FK → `study_sessions`, SET NULL | Optional session link |
| `rating` | `integer` | NOT NULL, CHECK 0-5 | SM-2 rating (0-5) |
| `time_to_answer` | `integer` | nullable | Milliseconds to answer |
| `reviewed_at` | `timestamptz` | NOT NULL, default `now()` | Review timestamp |

**Indexes:**
- `idx_card_reviews_user_id` on `user_id`
- `idx_card_reviews_flashcard_id` on `flashcard_id`
- `idx_card_reviews_session_id` on `session_id`
- `idx_card_reviews_reviewed_at` on `reviewed_at`

## Row Level Security (RLS) Policies

All tables have RLS enabled to ensure users can only access their own data.

### Decks Policies

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| `Users can view own decks` | SELECT | `auth.uid() = user_id` |
| `Users can create own decks` | INSERT | `auth.uid() = user_id` |
| `Users can update own decks` | UPDATE | `auth.uid() = user_id` |
| `Users can delete own decks` | DELETE | `auth.uid() = user_id` |

### Flashcards Policies

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| `Users can view flashcards in own decks` | SELECT | deck belongs to user |
| `Users can create flashcards in own decks` | INSERT | deck belongs to user |
| `Users can update flashcards in own decks` | UPDATE | deck belongs to user |
| `Users can delete flashcards in own decks` | DELETE | deck belongs to user |

### User Quotas Policies

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| `Users can view own quota` | SELECT | `auth.uid() = user_id` |
| `Users can update own quota` | UPDATE | `auth.uid() = user_id` |

### Study Sessions Policies

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| `Users can view own study sessions` | SELECT | `auth.uid() = user_id` |
| `Users can create own study sessions` | INSERT | `auth.uid() = user_id` |
| `Users can update own study sessions` | UPDATE | `auth.uid() = user_id` |

### Card Reviews Policies

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| `Users can view own card reviews` | SELECT | `auth.uid() = user_id` |
| `Users can create own card reviews` | INSERT | `auth.uid() = user_id` |

## Triggers

### `update_updated_at_column`

Automatically updates the `updated_at` column when a row is modified.

Applied to:
- `decks` table
- `flashcards` table

## Migration Files

| File | Description |
|------|-------------|
| `20231213000000_create_tables.sql` | Initial schema: decks, flashcards tables |
| `20241214000000_add_user_quotas.sql` | User quotas for AI generation limits |
| `20241214000001_add_spaced_repetition.sql` | SM-2 fields on flashcards table |
| `20241215000001_add_usage_statistics.sql` | Study sessions and card reviews tables |

## TypeScript Types

Types are defined in `src/db/database.types.ts`:

```typescript
// Row types (what you get from SELECT)
type Deck = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type Flashcard = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
};

type UserQuota = {
  user_id: string;
  ai_generation_count: number;
  ai_generation_limit: number;
  created_at: string;
  updated_at: string;
};

type StudySession = {
  id: string;
  user_id: string;
  deck_id: string;
  started_at: string;
  ended_at: string | null;
  cards_studied: number;
  cards_correct: number;
  cards_incorrect: number;
  created_at: string;
};

type CardReview = {
  id: string;
  flashcard_id: string;
  user_id: string;
  session_id: string | null;
  rating: number;
  time_to_answer: number | null;
  reviewed_at: string;
};

// Statistics types
interface UserStats {
  totalSessions: number;
  totalCardsReviewed: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageAccuracy: number;
  studyStreak: number;
  totalTimeStudied: number;
  reviewsToday: number;
  reviewsThisWeek: number;
}

interface DeckStats {
  deckId: string;
  deckName: string;
  totalCards: number;
  cardsDue: number;
  cardsLearning: number;
  cardsMastered: number;
  averageEasiness: number;
}
```

## Usage Examples

### Create a deck

```typescript
const { data, error } = await supabase
  .from('decks')
  .insert({ user_id: userId, name: 'My Deck' })
  .select()
  .single();
```

### Get user's decks

```typescript
const { data, error } = await supabase
  .from('decks')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get flashcards for a deck

```typescript
const { data, error } = await supabase
  .from('flashcards')
  .select('*')
  .eq('deck_id', deckId)
  .order('created_at', { ascending: true });
```

### Create flashcard with AI generation

```typescript
const { data, error } = await supabase
  .from('flashcards')
  .insert(
    flashcards.map(fc => ({
      deck_id: deckId,
      front: fc.front,
      back: fc.back,
    }))
  )
  .select();
```

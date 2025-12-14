# API Plan - 10xCards

## Overview

REST API for 10xCards flashcard application. All endpoints require authentication via Bearer token.

## Base URL

```
Development: http://localhost:3000/api
Production: https://10xcards.pages.dev/api
```

## Authentication

All API endpoints require a valid Supabase access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via Supabase Auth (login/signup).

## Response Format

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message" | [{ "message": "...", "path": [...] }]
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Decks API

### List Decks

```
GET /api/decks
```

Returns all decks owned by the authenticated user.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "My Deck",
      "description": "Optional description",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Deck

```
POST /api/decks
```

**Request Body:**
```json
{
  "name": "My Deck",
  "description": "Optional description"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 1-100 characters |
| description | string | No | - |

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Deck",
    "description": "Optional description",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Deck

```
GET /api/decks/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Deck",
    "description": "Optional description",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Deck

```
PUT /api/decks/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | No | 1-100 characters |
| description | string | No | - |

At least one field must be provided.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Updated Name",
    "description": "Updated description",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:01Z"
  }
}
```

### Delete Deck

```
DELETE /api/decks/:id
```

Deletes the deck and all associated flashcards (cascade delete).

**Response:**
```json
{
  "data": {
    "id": "uuid"
  }
}
```

---

## Flashcards API

### List Flashcards

```
GET /api/flashcards?deck_id=uuid
```

Returns all flashcards in the specified deck.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deck_id | uuid | Yes | Deck ID to filter by |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "deck_id": "uuid",
      "front": "Question",
      "back": "Answer",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Flashcard

```
POST /api/flashcards
```

**Request Body:**
```json
{
  "deck_id": "uuid",
  "front": "Question",
  "back": "Answer"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| deck_id | uuid | Yes | Valid deck ID owned by user |
| front | string | Yes | Min 1 character |
| back | string | Yes | Min 1 character |

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "deck_id": "uuid",
    "front": "Question",
    "back": "Answer",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Flashcard

```
GET /api/flashcards/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "deck_id": "uuid",
    "front": "Question",
    "back": "Answer",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Flashcard

```
PUT /api/flashcards/:id
```

**Request Body:**
```json
{
  "front": "Updated question",
  "back": "Updated answer"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| front | string | No | Min 1 character |
| back | string | No | Min 1 character |

At least one field must be provided.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "deck_id": "uuid",
    "front": "Updated question",
    "back": "Updated answer",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:01Z"
  }
}
```

### Delete Flashcard

```
DELETE /api/flashcards/:id
```

**Response:**
```json
{
  "data": {
    "id": "uuid"
  }
}
```

### Review Flashcard (Spaced Repetition)

```
POST /api/flashcards/:id/review
```

Submit a review rating for a flashcard using the SM-2 algorithm.

**Request Body:**
```json
{
  "rating": 4,
  "session_id": "uuid",
  "time_to_answer": 5000
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| rating | number | Yes | 0-5 (0=blackout, 1=again, 3=hard, 4=good, 5=easy) |
| session_id | uuid | No | Optional study session ID |
| time_to_answer | number | No | Milliseconds taken to answer |

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "deck_id": "uuid",
    "front": "Question",
    "back": "Answer",
    "easiness_factor": 2.6,
    "interval_days": 6,
    "repetitions": 3,
    "next_review_date": "2024-01-07",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:01Z"
  },
  "sm2": {
    "easiness_factor": 2.6,
    "interval_days": 6,
    "repetitions": 3,
    "next_review_date": "2024-01-07"
  }
}
```

### Bulk Create Flashcards

```
POST /api/flashcards/bulk
```

Create multiple flashcards at once (used after AI preview).

**Request Body:**
```json
{
  "deck_id": "uuid",
  "flashcards": [
    { "front": "Question 1", "back": "Answer 1" },
    { "front": "Question 2", "back": "Answer 2" }
  ],
  "ai_generated": true
}
```

**Response (201):**
```json
{
  "data": [
    {
      "id": "uuid",
      "deck_id": "uuid",
      "front": "Question 1",
      "back": "Answer 1",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Study Sessions API

### Create Study Session

```
POST /api/study-sessions
```

Start a new study session.

**Request Body:**
```json
{
  "deck_id": "uuid"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "deck_id": "uuid",
    "started_at": "2024-01-01T00:00:00Z",
    "ended_at": null,
    "cards_studied": 0,
    "cards_correct": 0,
    "cards_incorrect": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### List Study Sessions

```
GET /api/study-sessions?deck_id=uuid&limit=10&offset=0
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deck_id | uuid | No | Filter by deck |
| limit | number | No | Max results (default 20) |
| offset | number | No | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "deck_id": "uuid",
      "started_at": "2024-01-01T00:00:00Z",
      "ended_at": "2024-01-01T00:30:00Z",
      "cards_studied": 25,
      "cards_correct": 20,
      "cards_incorrect": 5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Update Study Session

```
PUT /api/study-sessions/:id
```

Update session stats (typically when ending a session).

**Request Body:**
```json
{
  "cards_studied": 25,
  "cards_correct": 20,
  "cards_incorrect": 5,
  "ended_at": "2024-01-01T00:30:00Z"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "deck_id": "uuid",
    "started_at": "2024-01-01T00:00:00Z",
    "ended_at": "2024-01-01T00:30:00Z",
    "cards_studied": 25,
    "cards_correct": 20,
    "cards_incorrect": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Statistics API

### Get User Statistics

```
GET /api/stats
```

Returns comprehensive user statistics including study metrics, deck progress, and review history.

**Response:**
```json
{
  "data": {
    "userStats": {
      "totalSessions": 50,
      "totalCardsReviewed": 500,
      "totalCorrect": 400,
      "totalIncorrect": 100,
      "averageAccuracy": 80.0,
      "studyStreak": 7,
      "totalTimeStudied": 300,
      "reviewsToday": 25,
      "reviewsThisWeek": 150
    },
    "deckStats": [
      {
        "deckId": "uuid",
        "deckName": "JavaScript Basics",
        "totalCards": 50,
        "cardsDue": 10,
        "cardsLearning": 15,
        "cardsMastered": 35,
        "averageEasiness": 2.65
      }
    ],
    "reviewsByDay": [
      {
        "date": "2024-01-01",
        "count": 25,
        "correct": 20,
        "incorrect": 5
      }
    ]
  }
}
```

---

## AI Generation API

### Generate Flashcards

```
POST /api/generate-flashcards
```

Uses AI to generate flashcards from provided text.

**Request Body:**
```json
{
  "text": "Content to generate flashcards from...",
  "deckId": "uuid",
  "count": 5
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| text | string | Yes | Min 10 characters |
| deckId | uuid | Yes | Valid deck ID owned by user |
| count | number | No | 1-20, default 5 |

**Response (201):**
```json
{
  "data": [
    {
      "id": "uuid",
      "deck_id": "uuid",
      "front": "Generated question 1",
      "back": "Generated answer 1",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Example cURL Commands

### Login (get token)
```bash
# Use Supabase Auth SDK or dashboard to get token
```

### List decks
```bash
curl -X GET http://localhost:3000/api/decks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create deck
```bash
curl -X POST http://localhost:3000/api/decks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "JavaScript Basics", "description": "Fundamental JS concepts"}'
```

### Update deck
```bash
curl -X PUT http://localhost:3000/api/decks/DECK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Delete deck
```bash
curl -X DELETE http://localhost:3000/api/decks/DECK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List flashcards
```bash
curl -X GET "http://localhost:3000/api/flashcards?deck_id=DECK_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create flashcard
```bash
curl -X POST http://localhost:3000/api/flashcards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deck_id": "DECK_ID", "front": "What is JavaScript?", "back": "A programming language"}'
```

### Update flashcard
```bash
curl -X PUT http://localhost:3000/api/flashcards/FLASHCARD_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"front": "Updated question", "back": "Updated answer"}'
```

### Delete flashcard
```bash
curl -X DELETE http://localhost:3000/api/flashcards/FLASHCARD_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Implementation Files

| Endpoint | File |
|----------|------|
| `/api/decks` | `src/pages/api/decks/index.ts` |
| `/api/decks/:id` | `src/pages/api/decks/[id].ts` |
| `/api/flashcards` | `src/pages/api/flashcards/index.ts` |
| `/api/flashcards/:id` | `src/pages/api/flashcards/[id]/index.ts` |
| `/api/flashcards/:id/review` | `src/pages/api/flashcards/[id]/review.ts` |
| `/api/flashcards/bulk` | `src/pages/api/flashcards/bulk.ts` |
| `/api/generate-flashcards` | `src/pages/api/generate-flashcards.ts` |
| `/api/user/quota` | `src/pages/api/user/quota.ts` |
| `/api/study-sessions` | `src/pages/api/study-sessions/index.ts` |
| `/api/study-sessions/:id` | `src/pages/api/study-sessions/[id].ts` |
| `/api/stats` | `src/pages/api/stats.ts` |

## Middleware

Authentication is handled by `src/middleware/index.ts` which:
1. Creates a Supabase client for each request
2. Validates Bearer token from Authorization header
3. Attaches `supabase` and `user` to `context.locals`

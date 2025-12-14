export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_quotas: {
        Row: {
          user_id: string;
          ai_generation_count: number;
          ai_generation_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          ai_generation_count?: number;
          ai_generation_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          ai_generation_count?: number;
          ai_generation_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_quotas_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards: {
        Row: {
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
        Insert: {
          id?: string;
          deck_id: string;
          front: string;
          back: string;
          easiness_factor?: number;
          interval_days?: number;
          repetitions?: number;
          next_review_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          front?: string;
          back?: string;
          easiness_factor?: number;
          interval_days?: number;
          repetitions?: number;
          next_review_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey";
            columns: ["deck_id"];
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
        ];
      };
      study_sessions: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          started_at?: string;
          ended_at?: string | null;
          cards_studied?: number;
          cards_correct?: number;
          cards_incorrect?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string;
          started_at?: string;
          ended_at?: string | null;
          cards_studied?: number;
          cards_correct?: number;
          cards_incorrect?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "study_sessions_deck_id_fkey";
            columns: ["deck_id"];
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
        ];
      };
      card_reviews: {
        Row: {
          id: string;
          flashcard_id: string;
          user_id: string;
          session_id: string | null;
          rating: number;
          time_to_answer: number | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          flashcard_id: string;
          user_id: string;
          session_id?: string | null;
          rating: number;
          time_to_answer?: number | null;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          flashcard_id?: string;
          user_id?: string;
          session_id?: string | null;
          rating?: number;
          time_to_answer?: number | null;
          reviewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "card_reviews_flashcard_id_fkey";
            columns: ["flashcard_id"];
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_reviews_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_reviews_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "study_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      get_user_quota: {
        Args: { p_user_id: string };
        Returns: { count: number; remaining: number; limit_value: number }[];
      };
      increment_ai_generation_count: {
        Args: { p_user_id: string; p_count: number };
        Returns: { new_count: number; remaining: number; limit_value: number }[];
      };
    };
    Enums: Record<never, never>;
  };
}

// Convenience types
export type Deck = Database["public"]["Tables"]["decks"]["Row"];
export type DeckInsert = Database["public"]["Tables"]["decks"]["Insert"];
export type DeckUpdate = Database["public"]["Tables"]["decks"]["Update"];

export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

export type UserQuota = Database["public"]["Tables"]["user_quotas"]["Row"];

export interface UserQuotaInfo {
  count: number;
  remaining: number;
  limit: number;
}

// SM-2 Spaced Repetition Types
export type ReviewRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2Result {
  easiness_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
}

// Study session types
export type StudySession = Database["public"]["Tables"]["study_sessions"]["Row"];
export type StudySessionInsert = Database["public"]["Tables"]["study_sessions"]["Insert"];
export type StudySessionUpdate = Database["public"]["Tables"]["study_sessions"]["Update"];

// Card review types
export type CardReview = Database["public"]["Tables"]["card_reviews"]["Row"];
export type CardReviewInsert = Database["public"]["Tables"]["card_reviews"]["Insert"];

// Statistics types
export interface UserStats {
  totalSessions: number;
  totalCardsReviewed: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageAccuracy: number;
  studyStreak: number;
  totalTimeStudied: number; // in minutes
  reviewsToday: number;
  reviewsThisWeek: number;
}

export interface DeckStats {
  deckId: string;
  deckName: string;
  totalCards: number;
  cardsDue: number;
  cardsLearning: number; // repetitions < 3
  cardsMastered: number; // repetitions >= 3
  averageEasiness: number;
}

export interface ReviewsByDay {
  date: string;
  count: number;
  correct: number;
  incorrect: number;
}

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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          front: string;
          back: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          front?: string;
          back?: string;
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
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
          }
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
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types
export type Deck = Database["public"]["Tables"]["decks"]["Row"];
export type DeckInsert = Database["public"]["Tables"]["decks"]["Insert"];
export type DeckUpdate = Database["public"]["Tables"]["decks"]["Update"];

export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];

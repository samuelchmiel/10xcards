-- Migration: Create decks and flashcards tables
-- Description: Initial database schema for 10xCards

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create decks table
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL CHECK (char_length(front) >= 1),
    back TEXT NOT NULL CHECK (char_length(back) >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_decks_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decks table
-- Users can only view their own decks
CREATE POLICY "Users can view own decks"
    ON decks FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create decks for themselves
CREATE POLICY "Users can create own decks"
    ON decks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own decks
CREATE POLICY "Users can update own decks"
    ON decks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own decks
CREATE POLICY "Users can delete own decks"
    ON decks FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for flashcards table
-- Users can view flashcards in their own decks
CREATE POLICY "Users can view flashcards in own decks"
    ON flashcards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

-- Users can create flashcards in their own decks
CREATE POLICY "Users can create flashcards in own decks"
    ON flashcards FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

-- Users can update flashcards in their own decks
CREATE POLICY "Users can update flashcards in own decks"
    ON flashcards FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

-- Users can delete flashcards in their own decks
CREATE POLICY "Users can delete flashcards in own decks"
    ON flashcards FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM decks
        WHERE decks.id = flashcards.deck_id
        AND decks.user_id = auth.uid()
    ));

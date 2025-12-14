-- Migration: Add spaced repetition (SM-2) fields to flashcards
-- Description: Implements SM-2 algorithm for optimized learning

-- Add SM-2 fields to flashcards table
ALTER TABLE flashcards
ADD COLUMN easiness_factor REAL NOT NULL DEFAULT 2.5,
ADD COLUMN interval_days INTEGER NOT NULL DEFAULT 0,
ADD COLUMN repetitions INTEGER NOT NULL DEFAULT 0,
ADD COLUMN next_review_date DATE;

-- Create index for efficient due card queries
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review_date)
WHERE next_review_date IS NOT NULL;

-- Add comment explaining the fields
COMMENT ON COLUMN flashcards.easiness_factor IS 'SM-2 easiness factor (1.3-2.5+), affects interval growth';
COMMENT ON COLUMN flashcards.interval_days IS 'Days until next review';
COMMENT ON COLUMN flashcards.repetitions IS 'Number of successful consecutive reviews';
COMMENT ON COLUMN flashcards.next_review_date IS 'Date when card is due for review (NULL = new card)';

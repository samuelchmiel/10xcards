/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * Based on the SuperMemo SM-2 algorithm:
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * Rating scale:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but correct answer seemed familiar
 * 2 - Incorrect, but correct answer was easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response
 */

import type { ReviewRating, SM2Result, Flashcard } from "@/db/database.types";

const MIN_EASINESS_FACTOR = 1.3;
const DEFAULT_EASINESS_FACTOR = 2.5;

/**
 * Calculate new SM-2 parameters after a review
 */
export function calculateSM2(
  currentEF: number,
  currentInterval: number,
  currentRepetitions: number,
  rating: ReviewRating
): SM2Result {
  let newEF = currentEF;
  let newInterval: number;
  let newRepetitions: number;

  // Calculate new easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const qualityDiff = 5 - rating;
  newEF = currentEF + (0.1 - qualityDiff * (0.08 + qualityDiff * 0.02));

  // EF must not fall below 1.3
  if (newEF < MIN_EASINESS_FACTOR) {
    newEF = MIN_EASINESS_FACTOR;
  }

  // Determine if recall was successful (rating >= 3)
  if (rating >= 3) {
    // Successful recall
    if (currentRepetitions === 0) {
      newInterval = 1;
    } else if (currentRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * currentEF);
    }
    newRepetitions = currentRepetitions + 1;
  } else {
    // Failed recall - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easiness_factor: Math.round(newEF * 100) / 100, // Round to 2 decimal places
    interval_days: newInterval,
    repetitions: newRepetitions,
    next_review_date: nextReviewDate.toISOString().split("T")[0], // YYYY-MM-DD format
  };
}

/**
 * Calculate SM-2 for a flashcard
 */
export function reviewFlashcard(flashcard: Flashcard, rating: ReviewRating): SM2Result {
  return calculateSM2(
    flashcard.easiness_factor ?? DEFAULT_EASINESS_FACTOR,
    flashcard.interval_days ?? 0,
    flashcard.repetitions ?? 0,
    rating
  );
}

/**
 * Check if a flashcard is due for review
 */
export function isDue(flashcard: Flashcard): boolean {
  if (!flashcard.next_review_date) {
    // New card, always due
    return true;
  }

  const today = new Date().toISOString().split("T")[0];
  return flashcard.next_review_date <= today;
}

/**
 * Get human-readable label for rating
 */
export function getRatingLabel(rating: ReviewRating): string {
  const labels: Record<ReviewRating, string> = {
    0: "Blackout",
    1: "Wrong",
    2: "Hard",
    3: "Difficult",
    4: "Good",
    5: "Easy",
  };
  return labels[rating];
}

/**
 * Simplified rating options for UI (4 buttons)
 */
export interface RatingOption {
  rating: ReviewRating;
  label: string;
  description: string;
  color: string;
}

export const RATING_OPTIONS: RatingOption[] = [
  {
    rating: 1,
    label: "Again",
    description: "Forgot completely",
    color: "destructive",
  },
  {
    rating: 3,
    label: "Hard",
    description: "Remembered with difficulty",
    color: "warning",
  },
  {
    rating: 4,
    label: "Good",
    description: "Remembered correctly",
    color: "default",
  },
  {
    rating: 5,
    label: "Easy",
    description: "Remembered instantly",
    color: "success",
  },
];

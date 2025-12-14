import { describe, it, expect } from "vitest";
import { calculateSM2, isDue, RATING_OPTIONS } from "./spaced-repetition";
import type { Flashcard } from "@/db/database.types";

describe("SM-2 Algorithm", () => {
  describe("calculateSM2", () => {
    it("should set interval to 1 day for first successful review", () => {
      const result = calculateSM2(2.5, 0, 0, 4);

      expect(result.interval_days).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it("should set interval to 6 days for second successful review", () => {
      const result = calculateSM2(2.5, 1, 1, 4);

      expect(result.interval_days).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it("should multiply interval by EF for subsequent reviews", () => {
      const result = calculateSM2(2.5, 6, 2, 4);

      expect(result.interval_days).toBe(15); // 6 * 2.5 = 15
      expect(result.repetitions).toBe(3);
    });

    it("should reset repetitions and interval on failed recall (rating < 3)", () => {
      const result = calculateSM2(2.5, 15, 3, 2);

      expect(result.interval_days).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it("should increase EF for easy ratings (5)", () => {
      const result = calculateSM2(2.5, 1, 1, 5);

      expect(result.easiness_factor).toBeGreaterThan(2.5);
    });

    it("should decrease EF for difficult ratings (3)", () => {
      const result = calculateSM2(2.5, 1, 1, 3);

      expect(result.easiness_factor).toBeLessThan(2.5);
    });

    it("should not let EF fall below 1.3", () => {
      const result = calculateSM2(1.3, 1, 1, 0);

      expect(result.easiness_factor).toBeGreaterThanOrEqual(1.3);
    });

    it("should return valid date string for next_review_date", () => {
      const result = calculateSM2(2.5, 0, 0, 4);

      expect(result.next_review_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("isDue", () => {
    it("should return true for new cards (no next_review_date)", () => {
      const card = {
        next_review_date: null,
      } as Flashcard;

      expect(isDue(card)).toBe(true);
    });

    it("should return true for cards due today", () => {
      const today = new Date().toISOString().split("T")[0];
      const card = {
        next_review_date: today,
      } as Flashcard;

      expect(isDue(card)).toBe(true);
    });

    it("should return true for overdue cards", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const card = {
        next_review_date: yesterday.toISOString().split("T")[0],
      } as Flashcard;

      expect(isDue(card)).toBe(true);
    });

    it("should return false for cards due in the future", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const card = {
        next_review_date: tomorrow.toISOString().split("T")[0],
      } as Flashcard;

      expect(isDue(card)).toBe(false);
    });
  });

  describe("RATING_OPTIONS", () => {
    it("should have 4 rating options", () => {
      expect(RATING_OPTIONS).toHaveLength(4);
    });

    it("should have ratings 1, 3, 4, 5", () => {
      const ratings = RATING_OPTIONS.map((o) => o.rating);
      expect(ratings).toEqual([1, 3, 4, 5]);
    });
  });
});

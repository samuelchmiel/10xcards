import { describe, it, expect } from "vitest";
import {
  CreateDeckSchema,
  UpdateDeckSchema,
  CreateFlashcardSchema,
  UpdateFlashcardSchema,
  GenerateFlashcardsSchema,
} from "./validators";

describe("CreateDeckSchema", () => {
  it("validates correct deck data", () => {
    const result = CreateDeckSchema.safeParse({
      name: "My Deck",
      description: "A test deck",
    });
    expect(result.success).toBe(true);
  });

  it("validates deck without description", () => {
    const result = CreateDeckSchema.safeParse({
      name: "My Deck",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CreateDeckSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Name is required");
    }
  });

  it("rejects name over 100 characters", () => {
    const result = CreateDeckSchema.safeParse({
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Name must be 100 characters or less");
    }
  });

  it("accepts name with exactly 100 characters", () => {
    const result = CreateDeckSchema.safeParse({
      name: "a".repeat(100),
    });
    expect(result.success).toBe(true);
  });
});

describe("UpdateDeckSchema", () => {
  it("validates partial update with name only", () => {
    const result = UpdateDeckSchema.safeParse({
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial update with description only", () => {
    const result = UpdateDeckSchema.safeParse({
      description: "Updated description",
    });
    expect(result.success).toBe(true);
  });

  it("validates empty object (no updates)", () => {
    const result = UpdateDeckSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("CreateFlashcardSchema", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  it("validates correct flashcard data", () => {
    const result = CreateFlashcardSchema.safeParse({
      deck_id: validUuid,
      front: "What is TypeScript?",
      back: "A typed superset of JavaScript",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID for deck_id", () => {
    const result = CreateFlashcardSchema.safeParse({
      deck_id: "not-a-uuid",
      front: "Question",
      back: "Answer",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Invalid deck ID");
    }
  });

  it("rejects empty front text", () => {
    const result = CreateFlashcardSchema.safeParse({
      deck_id: validUuid,
      front: "",
      back: "Answer",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Front text is required");
    }
  });

  it("rejects empty back text", () => {
    const result = CreateFlashcardSchema.safeParse({
      deck_id: validUuid,
      front: "Question",
      back: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Back text is required");
    }
  });
});

describe("UpdateFlashcardSchema", () => {
  it("validates partial update with front only", () => {
    const result = UpdateFlashcardSchema.safeParse({
      front: "Updated question",
    });
    expect(result.success).toBe(true);
  });

  it("validates partial update with back only", () => {
    const result = UpdateFlashcardSchema.safeParse({
      back: "Updated answer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty front text when provided", () => {
    const result = UpdateFlashcardSchema.safeParse({
      front: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("GenerateFlashcardsSchema", () => {
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";

  it("validates correct generation request", () => {
    const result = GenerateFlashcardsSchema.safeParse({
      text: "This is some sample text for generating flashcards.",
      deck_id: validUuid,
      count: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects text shorter than 10 characters", () => {
    const result = GenerateFlashcardsSchema.safeParse({
      text: "Short",
      deck_id: validUuid,
      count: 5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Text must be at least 10 characters");
    }
  });

  it("rejects text longer than 10000 characters", () => {
    const result = GenerateFlashcardsSchema.safeParse({
      text: "a".repeat(10001),
      deck_id: validUuid,
      count: 5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Text must be 10000 characters or less");
    }
  });

  it("rejects count less than 1", () => {
    const result = GenerateFlashcardsSchema.safeParse({
      text: "Some valid text here",
      deck_id: validUuid,
      count: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Must generate at least 1 flashcard");
    }
  });

  it("rejects count greater than 20", () => {
    const result = GenerateFlashcardsSchema.safeParse({
      text: "Some valid text here",
      deck_id: validUuid,
      count: 21,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Cannot generate more than 20 flashcards");
    }
  });

  it("rejects non-integer count", () => {
    const result = GenerateFlashcardsSchema.safeParse({
      text: "Some valid text here",
      deck_id: validUuid,
      count: 5.5,
    });
    expect(result.success).toBe(false);
  });

  it("accepts boundary values (10 chars, count 1 and 20)", () => {
    const minResult = GenerateFlashcardsSchema.safeParse({
      text: "a".repeat(10),
      deck_id: validUuid,
      count: 1,
    });
    expect(minResult.success).toBe(true);

    const maxResult = GenerateFlashcardsSchema.safeParse({
      text: "a".repeat(10),
      deck_id: validUuid,
      count: 20,
    });
    expect(maxResult.success).toBe(true);
  });
});

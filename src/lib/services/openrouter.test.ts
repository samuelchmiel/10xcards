import { describe, it, expect } from "vitest";
import { parseFlashcardsResponse } from "./openrouter";

describe("parseFlashcardsResponse", () => {
  it("parses valid JSON array", () => {
    const input = '[{"front": "What is TypeScript?", "back": "A typed superset of JavaScript"}]';
    const result = parseFlashcardsResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      front: "What is TypeScript?",
      back: "A typed superset of JavaScript",
    });
  });

  it("parses multiple flashcards", () => {
    const input = `[
      {"front": "Question 1", "back": "Answer 1"},
      {"front": "Question 2", "back": "Answer 2"},
      {"front": "Question 3", "back": "Answer 3"}
    ]`;
    const result = parseFlashcardsResponse(input);
    expect(result).toHaveLength(3);
    expect(result[0].front).toBe("Question 1");
    expect(result[2].back).toBe("Answer 3");
  });

  it("extracts JSON from markdown code blocks", () => {
    const input = '```json\n[{"front": "Q", "back": "A"}]\n```';
    const result = parseFlashcardsResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ front: "Q", back: "A" });
  });

  it("extracts JSON from markdown code blocks without language specifier", () => {
    const input = '```\n[{"front": "Q", "back": "A"}]\n```';
    const result = parseFlashcardsResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ front: "Q", back: "A" });
  });

  it("trims whitespace from front and back", () => {
    const input = '[{"front": "  Question  ", "back": "  Answer  "}]';
    const result = parseFlashcardsResponse(input);
    expect(result[0]).toEqual({
      front: "Question",
      back: "Answer",
    });
  });

  it("throws error for invalid JSON", () => {
    const input = "not valid json";
    expect(() => parseFlashcardsResponse(input)).toThrow(
      "Failed to parse AI response"
    );
  });

  it("throws error for non-array response", () => {
    const input = '{"front": "Q", "back": "A"}';
    expect(() => parseFlashcardsResponse(input)).toThrow(
      "Failed to parse AI response"
    );
  });

  it("throws error for flashcard missing front", () => {
    const input = '[{"back": "A"}]';
    expect(() => parseFlashcardsResponse(input)).toThrow(
      "Failed to parse AI response"
    );
  });

  it("throws error for flashcard missing back", () => {
    const input = '[{"front": "Q"}]';
    expect(() => parseFlashcardsResponse(input)).toThrow(
      "Failed to parse AI response"
    );
  });

  it("throws error for flashcard with non-string front", () => {
    const input = '[{"front": 123, "back": "A"}]';
    expect(() => parseFlashcardsResponse(input)).toThrow(
      "Failed to parse AI response"
    );
  });

  it("handles empty array", () => {
    const input = "[]";
    const result = parseFlashcardsResponse(input);
    expect(result).toHaveLength(0);
  });

  it("handles JSON with extra whitespace", () => {
    const input = `
      [
        {
          "front": "Q",
          "back": "A"
        }
      ]
    `;
    const result = parseFlashcardsResponse(input);
    expect(result).toHaveLength(1);
  });
});

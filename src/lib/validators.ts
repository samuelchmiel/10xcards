import { z } from "zod";

// Deck schemas
export const CreateDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().optional(),
});

export const UpdateDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").optional(),
  description: z.string().optional(),
});

// Flashcard schemas
export const CreateFlashcardSchema = z.object({
  deck_id: z.string().uuid("Invalid deck ID"),
  front: z.string().min(1, "Front text is required"),
  back: z.string().min(1, "Back text is required"),
});

export const UpdateFlashcardSchema = z.object({
  front: z.string().min(1, "Front text is required").optional(),
  back: z.string().min(1, "Back text is required").optional(),
});

// AI generation schema
export const GenerateFlashcardsSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters").max(10000, "Text must be 10000 characters or less"),
  deck_id: z.string().uuid("Invalid deck ID"),
  count: z
    .number()
    .int()
    .min(1, "Must generate at least 1 flashcard")
    .max(20, "Cannot generate more than 20 flashcards"),
  preview: z.boolean().optional().default(false),
});

// Bulk create flashcards schema (for saving AI-generated cards after preview)
export const BulkCreateFlashcardsSchema = z.object({
  deck_id: z.string().uuid("Invalid deck ID"),
  flashcards: z
    .array(
      z.object({
        front: z.string().min(1, "Front text is required"),
        back: z.string().min(1, "Back text is required"),
      })
    )
    .min(1, "At least one flashcard is required"),
  ai_generated: z.boolean().optional().default(false),
});

// Review flashcard schema (SM-2 spaced repetition)
export const ReviewFlashcardSchema = z.object({
  rating: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

// Type exports
export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;
export type CreateFlashcardInput = z.infer<typeof CreateFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof UpdateFlashcardSchema>;
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsSchema>;
export type BulkCreateFlashcardsInput = z.infer<typeof BulkCreateFlashcardsSchema>;
export type ReviewFlashcardInput = z.infer<typeof ReviewFlashcardSchema>;

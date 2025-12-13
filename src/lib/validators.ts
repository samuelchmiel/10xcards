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

// Type exports
export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;
export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;
export type CreateFlashcardInput = z.infer<typeof CreateFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof UpdateFlashcardSchema>;

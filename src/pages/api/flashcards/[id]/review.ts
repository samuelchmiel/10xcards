import type { APIRoute } from "astro";
import { ReviewFlashcardSchema } from "@/lib/validators";
import { reviewFlashcard } from "@/lib/services/spaced-repetition";
import type { Flashcard } from "@/db/database.types";

export const prerender = false;

// POST /api/flashcards/[id]/review - Submit a review for a flashcard
export const POST: APIRoute = async ({ params, request, locals }) => {
  const { supabase, user } = locals;
  const { id } = params;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing flashcard ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validation = ReviewFlashcardSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { rating, session_id, time_to_answer } = validation.data;

  // Get current flashcard data (with ownership check via RLS join)
  const { data: flashcard, error: fetchError } = await supabase
    .from("flashcards")
    .select("*, decks!inner(id)")
    .eq("id", id)
    .single();

  if (fetchError || !flashcard) {
    return new Response(JSON.stringify({ error: "Flashcard not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Calculate new SM-2 values
  const sm2Result = reviewFlashcard(flashcard as Flashcard, rating);

  // Update flashcard with new SM-2 values
  const { data: updated, error: updateError } = await supabase
    .from("flashcards")
    .update({
      easiness_factor: sm2Result.easiness_factor,
      interval_days: sm2Result.interval_days,
      repetitions: sm2Result.repetitions,
      next_review_date: sm2Result.next_review_date,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Log the review in card_reviews table for analytics
  await supabase.from("card_reviews").insert({
    flashcard_id: id,
    user_id: user.id,
    session_id: session_id || null,
    rating,
    time_to_answer: time_to_answer || null,
  });

  return new Response(
    JSON.stringify({
      data: updated,
      sm2: sm2Result,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};

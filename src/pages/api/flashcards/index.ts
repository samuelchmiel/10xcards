import type { APIRoute } from "astro";
import { CreateFlashcardSchema } from "@/lib/validators";
import { z } from "zod";

export const prerender = false;

const QuerySchema = z.object({
  deck_id: z.string().uuid("Invalid deck ID"),
  due: z.enum(["true", "false"]).optional(),
});

// GET /api/flashcards?deck_id=xxx&due=true - List flashcards for a deck (optionally filter by due)
export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const deckId = url.searchParams.get("deck_id");
  const due = url.searchParams.get("due");
  const validation = QuerySchema.safeParse({ deck_id: deckId, due: due || undefined });

  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify deck ownership (RLS handles this, but we check explicitly for 404)
  const { data: deck } = await supabase.from("decks").select("id").eq("id", validation.data.deck_id).single();

  if (!deck) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build query
  let query = supabase.from("flashcards").select("*").eq("deck_id", validation.data.deck_id);

  // Filter for due cards if requested
  if (validation.data.due === "true") {
    const today = new Date().toISOString().split("T")[0];
    // Cards are due if: next_review_date is null (new card) OR next_review_date <= today
    query = query.or(`next_review_date.is.null,next_review_date.lte.${today}`);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// POST /api/flashcards - Create new flashcard
export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
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

  const validation = CreateFlashcardSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { deck_id, front, back } = validation.data;

  // Verify deck ownership
  const { data: deck } = await supabase.from("decks").select("id").eq("id", deck_id).single();

  if (!deck) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase.from("flashcards").insert({ deck_id, front, back }).select().single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

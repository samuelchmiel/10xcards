import type { APIRoute } from "astro";
import { CreateFlashcardSchema } from "@/lib/validators";
import { z } from "zod";

export const prerender = false;

const QuerySchema = z.object({
  deck_id: z.string().uuid("Invalid deck ID"),
});

// GET /api/flashcards?deck_id=xxx - List flashcards for a deck
export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const deckId = url.searchParams.get("deck_id");
  const validation = QuerySchema.safeParse({ deck_id: deckId });

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

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("deck_id", validation.data.deck_id)
    .order("created_at", { ascending: true });

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

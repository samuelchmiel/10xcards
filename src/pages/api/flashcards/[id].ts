import type { APIRoute } from "astro";
import { UpdateFlashcardSchema } from "@/lib/validators";

export const prerender = false;

// GET /api/flashcards/[id] - Get single flashcard
export const GET: APIRoute = async ({ params, locals }) => {
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

  // Get flashcard with deck info to verify ownership via RLS
  const { data, error } = await supabase.from("flashcards").select("*, decks!inner(id)").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Remove the joined deck from response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { decks: _decks, ...flashcard } = data;

  return new Response(JSON.stringify({ data: flashcard }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// PUT /api/flashcards/[id] - Update flashcard
export const PUT: APIRoute = async ({ params, request, locals }) => {
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

  const validation = UpdateFlashcardSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const updateData = validation.data;
  if (Object.keys(updateData).length === 0) {
    return new Response(JSON.stringify({ error: "No fields to update" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify flashcard exists and user owns the deck (via RLS join)
  const { data: existing } = await supabase.from("flashcards").select("id, decks!inner(id)").eq("id", id).single();

  if (!existing) {
    return new Response(JSON.stringify({ error: "Flashcard not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase.from("flashcards").update(updateData).eq("id", id).select().single();

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

// DELETE /api/flashcards/[id] - Delete flashcard
export const DELETE: APIRoute = async ({ params, locals }) => {
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

  // Verify flashcard exists and user owns the deck (via RLS join)
  const { data: existing } = await supabase.from("flashcards").select("id, decks!inner(id)").eq("id", id).single();

  if (!existing) {
    return new Response(JSON.stringify({ error: "Flashcard not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.from("flashcards").delete().eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data: { id } }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

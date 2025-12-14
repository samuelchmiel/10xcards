import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const StartSessionSchema = z.object({
  deck_id: z.string().uuid(),
});

// POST /api/study-sessions - Start a new study session
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

  const validation = StartSessionSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { deck_id } = validation.data;

  // Verify deck exists and user owns it
  const { data: deck, error: deckError } = await supabase.from("decks").select("id").eq("id", deck_id).single();

  if (deckError || !deck) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create new study session
  const { data: session, error: sessionError } = await supabase
    .from("study_sessions")
    .insert({
      user_id: user.id,
      deck_id,
    })
    .select()
    .single();

  if (sessionError) {
    return new Response(JSON.stringify({ error: sessionError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data: session }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

// GET /api/study-sessions - Get user's study sessions
export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const { data: sessions, error } = await supabase
    .from("study_sessions")
    .select("*, decks(name)")
    .order("started_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data: sessions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

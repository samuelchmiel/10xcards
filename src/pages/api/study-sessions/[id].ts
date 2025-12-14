import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const UpdateSessionSchema = z.object({
  cards_studied: z.number().int().min(0).optional(),
  cards_correct: z.number().int().min(0).optional(),
  cards_incorrect: z.number().int().min(0).optional(),
  ended_at: z.string().datetime().optional(),
});

// PUT /api/study-sessions/[id] - Update/end a study session
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
    return new Response(JSON.stringify({ error: "Missing session ID" }), {
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

  const validation = UpdateSessionSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Update the session (RLS will ensure user owns it)
  const { data: session, error } = await supabase
    .from("study_sessions")
    .update(validation.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data: session }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

// GET /api/study-sessions/[id] - Get a specific study session
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
    return new Response(JSON.stringify({ error: "Missing session ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: session, error } = await supabase.from("study_sessions").select("*, decks(name)").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ data: session }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

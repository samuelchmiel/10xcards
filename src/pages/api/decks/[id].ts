import type { APIRoute } from "astro";
import { UpdateDeckSchema } from "@/lib/validators";

export const prerender = false;

// GET /api/decks/[id] - Get single deck
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
    return new Response(JSON.stringify({ error: "Missing deck ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase.from("decks").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
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

// PUT /api/decks/[id] - Update deck
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
    return new Response(JSON.stringify({ error: "Missing deck ID" }), {
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

  const validation = UpdateDeckSchema.safeParse(body);
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

  const { data, error } = await supabase.from("decks").update(updateData).eq("id", id).select().single();

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
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

// DELETE /api/decks/[id] - Delete deck
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
    return new Response(JSON.stringify({ error: "Missing deck ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // First check if deck exists (RLS will filter to only user's decks)
  const { data: existing } = await supabase.from("decks").select("id").eq("id", id).single();

  if (!existing) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.from("decks").delete().eq("id", id);

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

import type { APIRoute } from "astro";
import { BulkCreateFlashcardsSchema } from "@/lib/validators";

export const prerender = false;

// POST /api/flashcards/bulk - Create multiple flashcards (for saving AI-generated cards after preview)
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

  const validation = BulkCreateFlashcardsSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { deck_id, flashcards, ai_generated } = validation.data;

  // Verify deck ownership
  const { data: deck } = await supabase.from("decks").select("id").eq("id", deck_id).single();

  if (!deck) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If AI-generated, check and increment quota
  if (ai_generated) {
    const { data: quotaData, error: quotaError } = await supabase.rpc("get_user_quota", {
      p_user_id: user.id,
    });

    if (quotaError) {
      return new Response(JSON.stringify({ error: "Failed to check quota" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const quota = quotaData?.[0];
    if (quota && quota.remaining < flashcards.length) {
      return new Response(
        JSON.stringify({
          error: `AI generation limit reached. You have ${quota.remaining} generations remaining.`,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  // Insert flashcards
  const flashcardsToInsert = flashcards.map((fc) => ({
    deck_id,
    front: fc.front,
    back: fc.back,
  }));

  const { data, error } = await supabase.from("flashcards").insert(flashcardsToInsert).select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If AI-generated, increment quota
  if (ai_generated && data) {
    const { error: incrementError } = await supabase.rpc("increment_ai_generation_count", {
      p_user_id: user.id,
      p_count: data.length,
    });

    if (incrementError) {
      // Log but don't fail - flashcards were already created
      console.error("Failed to increment quota:", incrementError.message);
    }
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

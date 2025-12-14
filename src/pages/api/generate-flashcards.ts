import type { APIRoute } from "astro";
import { GenerateFlashcardsSchema } from "@/lib/validators";
import { generateFlashcardsFromText } from "@/lib/services/openrouter";

export const prerender = false;

// POST /api/generate-flashcards - Generate flashcards using AI
export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user, runtime } = locals;
  // Get API key from Cloudflare runtime env (production) or import.meta.env (local dev)
  const openRouterApiKey = runtime?.env?.OPENROUTER_API_KEY;

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

  const validation = GenerateFlashcardsSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { text, deck_id, count, preview } = validation.data;

  // Check user's AI generation quota
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
  if (quota && quota.remaining < count) {
    return new Response(
      JSON.stringify({
        error: `AI generation limit reached. You have ${quota.remaining} generations remaining out of ${quota.limit_value} total.`,
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Verify deck ownership
  const { data: deck } = await supabase.from("decks").select("id").eq("id", deck_id).single();

  if (!deck) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate flashcards using AI
  let generatedFlashcards;
  try {
    generatedFlashcards = await generateFlashcardsFromText(text, count, openRouterApiKey);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "AI generation failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Increment the user's AI generation count (quota is consumed at generation time)
  const generatedCount = generatedFlashcards.length;
  const { error: incrementError } = await supabase.rpc("increment_ai_generation_count", {
    p_user_id: user.id,
    p_count: generatedCount,
  });

  if (incrementError) {
    // Quota increment failure is non-critical, continue with response
  }

  // If preview mode, return generated cards without saving
  if (preview) {
    const previewCards = generatedFlashcards.map((fc, index) => ({
      id: `preview-${index}`,
      deck_id,
      front: fc.front,
      back: fc.back,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return new Response(JSON.stringify({ data: previewCards, preview: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Insert generated flashcards into database
  const flashcardsToInsert = generatedFlashcards.map((fc) => ({
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

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

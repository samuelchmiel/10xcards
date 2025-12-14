import type { APIRoute } from "astro";
import type { UserQuotaInfo } from "@/db/database.types";

export const prerender = false;

// GET /api/user/quota - Get user's AI generation quota
export const GET: APIRoute = async ({ locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase.rpc("get_user_quota", {
    p_user_id: user.id,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const quotaInfo: UserQuotaInfo = data?.[0]
    ? {
        count: data[0].count,
        remaining: data[0].remaining,
        limit: data[0].limit_value,
      }
    : { count: 0, remaining: 100, limit: 100 };

  return new Response(JSON.stringify({ data: quotaInfo }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

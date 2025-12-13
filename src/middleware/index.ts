import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Create Supabase client
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: false,
    },
  });

  // Get access token from Authorization header
  const authHeader = context.request.headers.get("Authorization");
  let user = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) {
      user = data.user;
      // Set the session for RLS to work
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: "",
      });
    }
  }

  // Attach to locals
  context.locals.supabase = supabase;
  context.locals.user = user;

  return next();
});

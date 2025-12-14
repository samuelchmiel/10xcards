import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Get access token from Authorization header (API) or cookie (browser)
  const authHeader = context.request.headers.get("Authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : context.cookies.get("sb-access-token")?.value ?? null;

  // Create Supabase client with access token in headers for RLS to work
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    },
  });

  // Validate user if token provided
  let user = null;
  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (!error && data.user) {
      user = data.user;
    }
  }

  // Attach to locals
  context.locals.supabase = supabase;
  context.locals.user = user;

  const pathname = context.url.pathname;

  // Protect routes that require authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtectedRoute && !user) {
    return context.redirect("/login");
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && user) {
    return context.redirect("/dashboard");
  }

  return next();
});
